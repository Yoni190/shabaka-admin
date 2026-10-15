import axios from "axios";

export const ADMIN_TOKEN_KEY = "admin_auth_token";

/**
 * Shared axios instance for the Shabaka admin API.
 * Base URL comes from VITE_API_URL (see .env), never hardcoded.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach the admin bearer token to every request when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

/** Shape of Laravel's 422 validation error response. */
export interface LaravelValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/** Type guard for axios errors with a Laravel validation body. */
export function isValidationError(
  error: unknown,
): error is { response: { status: 422; data: LaravelValidationError } } {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 422 &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "errors" in error.response.data
  );
}

/** Extract a user-safe message from any error. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

/** Type guard for a 401 response carrying an optional `message`. */
export function isUnauthorized(
  error: unknown,
): error is { response: { status: 401; data: { message?: string } } } {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

/** Type guard for a 403 (e.g. authenticated but not an admin). */
export function isForbidden(
  error: unknown,
): error is { response: { status: 403; data: { message?: string } } } {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

export function isNotFound(
  error: unknown,
): error is { response: { status: 404; data: { message?: string } } } {
  return axios.isAxiosError(error) && error.response?.status === 404;
}