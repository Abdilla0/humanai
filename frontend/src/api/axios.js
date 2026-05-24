import axios from "axios";

import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authEndpoint = error.config?.url?.includes("/api/auth/login/")
      || error.config?.url?.includes("/api/auth/register/")
      || error.config?.url?.includes("/api/auth/google/");
    if (error.response?.status === 401 && !authEndpoint) {
      useAuthStore.getState().logout(false);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
