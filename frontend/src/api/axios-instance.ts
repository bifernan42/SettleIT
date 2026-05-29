import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Shared axios instance.
 * Base URL is read from the VITE_API_URL env var (defaults to the dev backend).
 * All generated orval hooks route through this instance — configure auth headers,
 * interceptors, or error handling here once and it applies everywhere.
 */
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Orval mutator — the function orval injects into every generated hook.
 * It unwraps the axios response so hooks receive `T` directly, not `AxiosResponse<T>`.
 */
export const customInstance = async <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await axiosInstance(config);
  return data;
};

// Re-export AxiosError so consuming code can narrow errors without importing axios directly.
export type { AxiosError };
