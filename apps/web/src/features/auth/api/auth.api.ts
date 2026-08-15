import { apiClient } from "@/lib/api-client";
import type { Role } from "@/store/session";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
}

export async function registerRequest(input: { name: string; email: string; password: string }) {
  const { data } = await apiClient.post<{ data: AuthUser; message: string }>(
    "/auth/register",
    input
  );
  return data;
}

export async function loginRequest(input: { email: string; password: string }) {
  const { data } = await apiClient.post<{ data: { user: AuthUser; accessToken: string } }>(
    "/auth/login",
    input
  );
  return data.data;
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}

export async function verifyEmailRequest(token: string) {
  const { data } = await apiClient.post("/auth/verify-email", { token });
  return data;
}

export async function forgotPasswordRequest(email: string) {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPasswordRequest(input: { token: string; password: string }) {
  const { data } = await apiClient.post("/auth/reset-password", input);
  return data;
}

export async function meRequest() {
  const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
  return data.data;
}
