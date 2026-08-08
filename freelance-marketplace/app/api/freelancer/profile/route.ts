import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  const profile = await prisma.freelancerProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  })

  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      fullName,
      bio,
      country,
      hourlyRate,
      skillIds,
    } = body

    const profile = await prisma.freelancerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      )
    }

    await prisma.freelancerProfile.update({
      where: {
        userId: session.user.id,
      },
      data: {
        fullName,
        bio,
        country,
        hourlyRate,
      },
    })

    await prisma.freelancerSkill.deleteMany({
      where: {
        freelancerId: profile.id,
      },
    })

    if (skillIds?.length) {
      await prisma.freelancerSkill.createMany({
        data: skillIds.map((skillId: string) => ({
          freelancerId: profile.id,
          skillId,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    )
  }
}