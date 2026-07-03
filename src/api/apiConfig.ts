import axios from "axios";

// Read backend API base URL from Vite environment variables (useful for split Vercel/Render deployments)
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";

if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

// Automatically attach stored JWT token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("xexit_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
