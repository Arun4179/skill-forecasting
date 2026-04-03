import axios from "axios";

/**
 * Get the API base URL from environment variables.
 * In production (Vercel), this will be your Render URL.
 * In development, it will be http://localhost:5000.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add authorization token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
