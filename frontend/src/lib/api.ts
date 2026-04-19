/**
 * Centralized API client.
 *
 * Base URL resolution:
 *   - Local dev:  Vite proxy forwards /api/* → http://localhost:8000 (see vite.config.ts)
 *   - Production: VITE_API_BASE_URL env var points to the Vercel-deployed backend
 *                 e.g. https://your-project.vercel.app
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  // We pass the user ID header since backend auth is a mock simulation
  const userId = localStorage.getItem("userId") || "u1";

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    "x-user-id": userId,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}));
    throw new Error(errorDetails.detail || "API request failed");
  }

  return response.json();
};
