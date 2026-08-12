export function calculateReputation(
  averageRating: number,
  totalReviews: number,
  completedJobs: number,
  verifiedReviews: number
) {
  const ratingScore =
    (averageRating / 5) *
    70;

  const reviewScore =
    Math.min(
      totalReviews,
      50
    ) * 0.4;

  const completionScore =
    Math.min(
      completedJobs,
      100
    ) * 0.1;

  const verifiedScore =
    verifiedReviews * 0.5;

  return Math.min(
    100,
    Number(
      (
        ratingScore +
        reviewScore +
        completionScore +
        verifiedScore
      ).toFixed(1)
    )
  );
}