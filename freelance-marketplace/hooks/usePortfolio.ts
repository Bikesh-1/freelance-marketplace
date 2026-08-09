import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getPortfolio = async () => {
  const { data } = await axios.get(
    "/api/freelancer/portfolio"
  );

  return data;
};

export const usePortfolio = () => {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
  });
};