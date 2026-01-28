import axios from "axios";

// If VITE_API_BASE_URL is set, use it. Otherwise, assume relative path "/api" for production or localhost:3000 for local dev if detected.
const isProduction = import.meta.env.PROD;
const baseURL = import.meta.env.VITE_API_BASE_URL || (isProduction ? "/api" : "http://localhost:3000/api");

const api = axios.create({
  baseURL
});

export default api;
