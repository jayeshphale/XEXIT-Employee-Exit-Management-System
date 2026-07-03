import axios from "axios";
import { User } from "../types";

export const registerUserApi = async (userData: Omit<User, "id" | "role"> & { password?: string }) => {
  const response = await axios.post("/api/auth/register", userData);
  return response.data;
};

export const loginUserApi = async (credentials: { email?: string; username?: string; password?: string }) => {
  const response = await axios.post("/api/auth/login", credentials);
  return response.data;
};

export const fetchCurrentUserApi = async () => {
  const response = await axios.get("/api/auth/me");
  return response.data;
};

export const updateUserProfileApi = async (profileData: Partial<User>) => {
  const response = await axios.put("/api/user/profile", profileData);
  return response.data;
};

export const changeUserPasswordApi = async (passwordData: { currentPassword?: string; newPassword?: string }) => {
  const response = await axios.put("/api/user/change-password", passwordData);
  return response.data;
};
