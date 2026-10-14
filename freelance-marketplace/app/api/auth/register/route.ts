import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;

    if (!name || name.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 8 || password.length > 128 ||
        !["CLIENT", "FREELANCER"].includes(role)) {
      return NextResponse.json({ error: "Invalid registration details" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name, email, password: hashedPassword, role },
        select: { id: true, name: true, email: true, role: true },
      });

      if (role === "FREELANCER") {
        await tx.freelancerProfile.create({
          data: {
            userId: created.id,
            title: "New Freelancer",
            bio: "Add your professional bio",
            experienceLevel: "BEGINNER",
            hourlyRate: 10,
          },
        });
      } else {
        await tx.clientProfile.create({
          data: {
            userId: created.id,
            companyName: "My Company",
            companyBio: "Add company description",
          },
        });
      }
      return created;
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
