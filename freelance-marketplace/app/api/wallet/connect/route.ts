import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const { walletAddress } = body

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },

      data: {
        walletAddress,
      },
    })

    return NextResponse.json({
      success: true,
      walletAddress: user.walletAddress,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    )
  }
}