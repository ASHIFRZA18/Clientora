import axios from "axios";
import { useSessionStore } from "@/store/session";

// In local dev, requests hit the Vite proxy at a relative path. In production,
// frontend (Vercel) and backend (Railway/Render) live on different domains, so
// the deployed frontend needs an absolute URL — set via VITE_API_URL at build time.
const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // sends the httpOnly refresh cookie
});

apiClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes("/auth/refresh");
    if (error.response?.status === 401 && !original._retry && !isRefreshCall) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(apiClient(original)));
        });
      }

      isRefreshing = true;
      try {
        const { data } = await apiClient.post("/auth/refresh");
        useSessionStore.getState().setAccessToken(data.accessToken);
        queue.forEach((cb) => cb());
        queue = [];
        return apiClient(original);
      } catch (refreshError) {
        useSessionStore.getState().clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
