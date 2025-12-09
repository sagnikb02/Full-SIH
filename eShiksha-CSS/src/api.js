// src/api.js
import axios from "axios";

// Always use production Render backend
const API_BASE_URL = "https://sih-pgbhh.onrender.com/api";

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
