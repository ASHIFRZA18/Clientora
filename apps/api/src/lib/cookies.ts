import type { Response } from "express";

export const REFRESH_COOKIE_NAME = "crm_refresh";
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In production, the frontend (e.g. Vercel) and API (e.g. Railway/Render) live
// on different domains, so the browser needs SameSite=None to send this cookie
// on cross-site requests — which requires Secure, hence tying both to the same
// flag. Locally (COOKIE_SECURE=false, no HTTPS) Lax is used instead since
// SameSite=None is rejected by browsers without Secure.
const isCrossSiteProd = process.env.COOKIE_SECURE === "true";

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isCrossSiteProd,
    sameSite: isCrossSiteProd ? "none" : "lax",
    path: "/api/v1/auth",
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: "/api/v1/auth",
    secure: isCrossSiteProd,
    sameSite: isCrossSiteProd ? "none" : "lax",
  });
}
