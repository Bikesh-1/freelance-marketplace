import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getExperience = async () => {
  const { data } = await axios.get(
    "/api/freelancer/experience"
  );

  return data;
};

export const useExperience = () => {
  return useQuery({
    queryKey: ["experience"],
    queryFn: getExperience,
  });
};