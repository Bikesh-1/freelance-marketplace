import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      clientId,
      freelancerId,
      rating,
      comment,
    } = body;

    if (
      !clientId ||
      !freelancerId ||
      !rating
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields",
        },
        { status: 400 }
      );
    }

    const completedEscrow =
  await prisma.escrow.findFirst({
    where: {
      status: "RELEASED",

      job: {
        clientId,
        selectedFreelancerId:
          freelancerId,
      },
    },
  });

    const review =
      await prisma.review.create({
        data: {
          clientId,
          freelancerId,
          rating,
          comment,
           isVerified:!!completedEscrow,
        },

        include: {
          client: true,
          freelancer: true,
        },
      });

    const reviews =
      await prisma.review.findMany({
        where: {
          freelancerId,
        },
      });

    const average =
      reviews.reduce(
        (
          sum,
          r
        ) =>
          sum + r.rating,
        0
      ) / reviews.length;

    await prisma.freelancerProfile.update({
      where: {
        id: freelancerId,
      },

      data: {
        averageRating:
          Number(
            average.toFixed(
              1
            )
          ),
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}