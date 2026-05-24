import api from "./axios";

export const submitJob = (text, mode, file = null) => {
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    return api.post("/api/humanize/", formData).then((res) => res.data);
  }
  return api.post("/api/humanize/", { text, mode }).then((res) => res.data);
};

export const getJob = (id) => api.get(`/api/humanize/${id}/`).then((res) => res.data);

export const getHistory = (page = 1) => api.get(`/api/humanize/history/?page=${page}`).then((res) => res.data);

