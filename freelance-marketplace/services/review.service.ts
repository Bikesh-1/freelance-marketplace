import axios from "axios";

export async function createReview(
  payload: {
    clientId: string;
    freelancerId: string;
    rating: number;
    comment: string;
  }
) {
  const { data } =
    await axios.post(
      "/api/reviews",
      payload
    );

  return data.review;
}

export async function getFreelancerReviews(
  freelancerId: string
) {
  const { data } =
    await axios.get(
      `/api/reviews/freelancer/${freelancerId}`
    );

  return data;
}