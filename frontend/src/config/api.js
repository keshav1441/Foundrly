// Centralized API configuration
// Uses VITE_API_BASE_URL environment variable
// Falls back to localhost for development

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // If environment variable is set and not empty, use it
  if (envUrl && envUrl.trim() !== "" && envUrl !== "undefined") {
    return envUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  // Fallback to localhost for development
  return "http://localhost:4000/api";
};

// Get base URL without /api suffix (for Socket.io)
const getBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace("/api", "");
};

export const API_BASE_URL = getApiBaseUrl();
export const BASE_URL = getBaseUrl();

// Export function for dynamic access if needed
export { getApiBaseUrl, getBaseUrl };
