import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ranking = {
  freelancerId: string;
  matchScore: number;
  skillScore?: number;
  ratingScore?: number;
  experienceScore?: number;
  reason?: string;
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { message: "Only clients can rank applications" },
        { status: 403 }
      );
    }

    const { jobId } = await params;
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { message: "Client profile not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findFirst({
      where: { id: jobId, clientId: clientProfile.id },
      include: { skills: { include: { skill: true } } },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Job not found or access denied" },
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        freelancer: {
          include: {
            skills: { include: { skill: true } },
            portfolios: { select: { title: true, description: true } },
            experiences: {
              select: { companyName: true, role: true, description: true },
            },
            reviews: {
              where: { isVisible: true },
              select: { rating: true },
            },
          },
        },
      },
    });

    if (applications.length === 0) {
      return NextResponse.json(
        { message: "There are no applications to rank yet." },
        { status: 400 }
      );
    }

    const serviceUrl = process.env.AI_SERVICE_URL?.replace(/\/+$/, "");
    const apiKey = process.env.AI_API_KEY;

    if (!serviceUrl || !apiKey || apiKey === "your-shared-secret") {
      return NextResponse.json(
        {
          message:
            "AI service is not configured correctly. Set AI_SERVICE_URL and the real shared AI_API_KEY in Vercel, matching the key configured on the AI service.",
        },
        { status: 503 }
      );
    }

    // The AI service accepts at most 300 candidates per request.
    const candidatesToRank = applications.slice(0, 300);

    const payload = {
      project: {
        id: job.id,
        title: job.title,
        description: job.description,
        required_skills:
          job.requiredSkills.length > 0
            ? job.requiredSkills
            : job.skills.map((item) => item.skill.name),
        budget: job.budget,
      },
      freelancers: candidatesToRank.map(({ freelancer }) => {
        const ratings = freelancer.reviews.map((review) => review.rating);
        const reviewAverage =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : freelancer.averageRating > 0
              ? freelancer.averageRating
              : null;

        return {
          id: freelancer.id,
          bio: freelancer.bio ?? "",
          skills: freelancer.skills.map((item) => item.skill.name),
          portfolio: freelancer.portfolios.map(
            (item) => `${item.title}: ${item.description}`
          ),
          experience: freelancer.experiences.map(
            (item) => `${item.role} at ${item.companyName}: ${item.description}`
          ),
          years_of_experience: freelancer.yearsOfExperience,
          average_rating: reviewAverage,
        };
      }),
      top_k: Math.min(candidatesToRank.length, 50),
    };

    let serviceResponse: Response;
    try {
      serviceResponse = await fetch(`${serviceUrl}/rank-freelancers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
    } catch {
      return NextResponse.json(
        { message: "Could not connect to the AI ranking service. Please try again shortly." },
        { status: 502 }
      );
    }

    const responseBody = (await serviceResponse.json().catch(() => null)) as
      | { recommendations?: Ranking[]; detail?: string; message?: string }
      | null;

    if (!serviceResponse.ok) {
      console.error("AI ranking service returned status", serviceResponse.status);
      return NextResponse.json(
        {
          message:
            serviceResponse.status === 401
              ? "AI service rejected the API key. Check that Vercel AI_API_KEY matches the key configured on the AI service."
              : responseBody?.detail ||
                responseBody?.message ||
                "AI ranking service failed.",
        },
        { status: serviceResponse.status === 401 ? 503 : 502 }
      );
    }

    const recommendations = responseBody?.recommendations;
    if (!Array.isArray(recommendations)) {
      return NextResponse.json(
        { message: "AI service returned an unexpected response format." },
        { status: 502 }
      );
    }

    const validFreelancerIds = new Set(
      candidatesToRank.map((application) => application.freelancerId)
    );
    const validRecommendations = recommendations.filter(
      (item) =>
        validFreelancerIds.has(item.freelancerId) &&
        Number.isFinite(item.matchScore) &&
        item.matchScore >= 0 &&
        item.matchScore <= 100
    );

    await prisma.application.updateMany({
      where: { jobId },
      data: { aiScore: null },
    });

    await Promise.all(
      validRecommendations.map((item) =>
        prisma.application.updateMany({
          where: { jobId, freelancerId: item.freelancerId },
          data: { aiScore: item.matchScore },
        })
      )
    );

    return NextResponse.json({
      message: "Freelancers ranked successfully.",
      count: validRecommendations.length,
      evaluatedCount: candidatesToRank.length,
      truncated: applications.length > candidatesToRank.length,
      recommendations: validRecommendations,
    });
  } catch (error) {
    console.error("Rank freelancer applications error:", error);
    return NextResponse.json(
      { message: "Unable to rank applications right now." },
      { status: 500 }
    );
  }
}
