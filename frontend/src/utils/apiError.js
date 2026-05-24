export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  if (!error.response) {
    return "Cannot connect to the backend server. Make sure Django is running on http://localhost:8000.";
  }

  const data = error.response.data;
  if (typeof data === "string") return data;
  if (data?.detail) return String(data.detail);
  if (data?.errors && typeof data.errors === "object") {
    for (const value of Object.values(data.errors)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === "string") return value;
    }
  }
  return fallback;
}

export function getFieldError(error, field) {
  const value = error.response?.data?.errors?.[field];
  if (Array.isArray(value) && value.length) return String(value[0]);
  if (typeof value === "string") return value;
  return "";
}

