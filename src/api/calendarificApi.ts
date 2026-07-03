import axios from "axios";

export const validateDateApi = async (dateStr: string, country: string) => {
  const response = await axios.get("/api/calendarific/validate-date", {
    params: {
      date: dateStr,
      country,
    },
  });
  return response.data;
};
