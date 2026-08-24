import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    if (role === "FREELANCER") {
      await prisma.freelancerProfile.create({
        data: {
          userId: user.id,
          title: "New Freelancer",
          bio: "Add your professional bio",
          experienceLevel: "BEGINNER",
          hourlyRate: 10,
        },
      });
    }

    if (role === "CLIENT") {
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          companyName: "My Company",
          companyBio: "Add company description",
        },
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}