// src/api.js
import axios from "axios";

// FINAL — Always use LIVE BACKEND URL
const api = axios.create({
  baseURL: "https://backend-sih-nkv5.onrender.com/api",  // UPDATED
});

// Attach token automatically for protected routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
