import axios from "axios";

export const submitResignationApi = async (resignationData: {
  reason: string;
  detailedDescription: string;
  lastWorkingDate: string;
  managerName: string;
  comments?: string;
  noticePeriod: number;
}) => {
  const response = await axios.post("/api/user/resign", resignationData);
  return response.data;
};

export const fetchEmployeeResignationsApi = async () => {
  const response = await axios.get("/api/user/resign");
  return response.data;
};

export const fetchAllResignationsApi = async (params: {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const response = await axios.get("/api/admin/resignations", { params });
  return response.data;
};

export const concludeResignationApi = async (data: {
  resignationId: string;
  action: "approve" | "reject";
  remarks?: string;
  finalLastWorkingDate?: string;
}) => {
  const response = await axios.put("/api/admin/conclude_resignation", data);
  return response.data;
};
