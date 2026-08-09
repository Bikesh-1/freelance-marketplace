import axios from "axios"

export const getJobs = async (
  search: string,
  jobType: string,
  minBudget: number
) => {
  const { data } = await axios.get(
    `/api/jobs?search=${search}&jobType=${jobType}&minBudget=${minBudget}`
  )

  return data.jobs
}