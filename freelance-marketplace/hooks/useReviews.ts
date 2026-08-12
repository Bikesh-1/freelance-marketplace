import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createReview,
  getFreelancerReviews,
} from "@/services/review.service";

export function useReviews(
  freelancerId: string
) {
  return useQuery({
    queryKey: [
      "reviews",
      freelancerId,
    ],

    queryFn: () =>
      getFreelancerReviews(
        freelancerId
      ),

    enabled:
      !!freelancerId,

    staleTime: 1000 * 60,
  });
}

export function useCreateReview() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createReview,

    onSuccess: (
      _,
      variables
    ) => {
      queryClient.invalidateQueries(
        {
          queryKey: [
            "reviews",
            variables.freelancerId,
          ],
        }
      );
    },
  });
}