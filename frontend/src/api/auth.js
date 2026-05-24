import api from "./axios";

export const login = (email, password) => api.post("/api/auth/login/", { email, password }).then((res) => res.data);

export const register = (email, password, full_name) =>
  api.post("/api/auth/register/", { email, password, full_name }).then((res) => res.data);

export const googleAuth = (accessToken) =>
  api.post("/api/auth/google/", { access_token: accessToken }).then((res) => res.data);

export const me = () => api.get("/api/auth/me/").then((res) => res.data);

export const logout = (refreshToken) => api.post("/api/auth/logout/", { refresh: refreshToken }).then((res) => res.data);

export const changePassword = (old_password, new_password) =>
  api.post("/api/auth/change-password/", { old_password, new_password }).then((res) => res.data);

export const updateProfile = (full_name) => api.patch("/api/auth/me/", { full_name }).then((res) => res.data);

export const deleteAccount = () => api.delete("/api/auth/me/").then((res) => res.data);

export const verifyEmail = (uid, token) => api.post("/api/auth/verify-email/", { uid, token }).then((res) => res.data);
