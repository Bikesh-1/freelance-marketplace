import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const getSkills = async () => {
  const { data } = await axios.get("/api/skills")
  return data.skills
}

export const useSkills = () => {
  return useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
    staleTime: 1000 * 60 * 10,
  })
}