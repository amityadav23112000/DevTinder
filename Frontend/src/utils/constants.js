// In production, nginx serves the frontend and proxies API requests on the
// same origin, so BASE_URL is empty (relative paths like "/login" resolve
// against whatever domain the page was loaded from). Locally, frontend and
// backend run on different ports, so we fall back to a direct URL.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:1234";

