import { create } from "zustand";

export type Role = "ADMIN" | "SALES_MANAGER" | "SALES_EXECUTIVE";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
}

interface SessionState {
  user: SessionUser | null;
  accessToken: string | null;
  setSession: (user: SessionUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () => set({ user: null, accessToken: null }),
}));
