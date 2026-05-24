import api from "./axios";

export const getStatus = () => api.get("/api/billing/status/").then((res) => res.data);

export const createCheckout = (plan) => api.post("/api/billing/checkout/", { plan }).then((res) => res.data);

export const getPortalUrl = () => api.post("/api/billing/portal/").then((res) => res.data);

