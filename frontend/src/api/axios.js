// ← one axios setup used everywhere.
// It adds the token to every request automatically, so we never write it by hand.

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// BEFORE every request: read the token from localStorage and attach it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AFTER every response: if the server says 401 (token missing/expired), log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const onLoginPage = window.location.pathname === "/login";
    if (error.response?.status === 401 && !onLoginPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
