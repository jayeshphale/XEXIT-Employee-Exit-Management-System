import axios from "axios";

export const submitExitResponseApi = async (responseData: {
  resignationId: string;
  whyLeaving: string;
  whatLiked: string;
  whatDisliked: string;
  recommendCompany: "yes" | "no" | "maybe";
  suggestions: string;
  overallRating: number;
  additionalFeedback?: string;
}) => {
  const response = await axios.post("/api/user/responses", responseData);
  return response.data;
};

export const fetchEmployeeExitResponseApi = async (resignationId: string) => {
  const response = await axios.get(`/api/user/responses/resignation/${resignationId}`);
  return response.data;
};

export const fetchAllExitResponsesApi = async (params: {
  search?: string;
  rating?: number;
  recommend?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const response = await axios.get("/api/admin/exit_responses", { params });
  return response.data;
};
