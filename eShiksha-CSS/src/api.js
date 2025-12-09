// src/api.js
import axios from "axios";

// Auto-detect environment
const API_BASE_URL = import.meta.env.PROD
  ? "https://sih-final-file.onrender.com/api"  // Render backend URL
  : "http://localhost:5000/api";               // Local backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
