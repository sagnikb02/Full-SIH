// src/api.js
import axios from "axios";

// Auto-detect environment
const API_BASE_URL = import.meta.env.PROD
  ? "https://sih-pgbhh.onrender.com/api"  // <-- Your real backend URL
  : "http://localhost:5000/api";          // For development

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token automatically for protected routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
