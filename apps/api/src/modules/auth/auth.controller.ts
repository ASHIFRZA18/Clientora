import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "../../lib/cookies.js";
import { getGoogleConsentUrl } from "../../lib/google.js";

export const authController = {
  async register(req: Request, res: Response) {
    const { user, devVerificationUrl } = await authService.register(req.body);
    res
      .status(201)
      .json({ data: { user, devVerificationUrl }, message: "Check your email to verify your account" });
  },

  // NEW
  async resendVerification(req: Request, res: Response) {
    const { devVerificationUrl } = await authService.resendVerification(req.body.email);
    // Same response regardless of whether the account exists or is already verified (prevents enumeration).
    res.status(200).json({ data: { sent: true, devVerificationUrl } });
  },

  async verifyEmail(req: Request, res: Response) {
    await authService.verifyEmail(req.body.token);
    res.status(200).json({ data: { verified: true } });
  },

  async login(req: Request, res: Response) {
    const { user, accessToken, refreshToken } = await authService.login(req.body, req.ip);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ data: { user, accessToken } });
  },

  googleRedirect(req: Request, res: Response) {
    res.redirect(getGoogleConsentUrl());
  },

  async googleCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

    if (!code) {
      return res.redirect(`${webOrigin}/login?error=google_auth_failed`);
    }

    try {
      const { accessToken, refreshToken } = await authService.loginWithGoogle(code, req.ip);
      setRefreshCookie(res, refreshToken);
      res.redirect(`${webOrigin}/oauth-success?token=${accessToken}`);
    } catch (err) {
      res.redirect(`${webOrigin}/login?error=google_auth_failed`);
    }
  },

  async refresh(req: Request, res: Response) {
    const incoming = req.cookies?.[REFRESH_COOKIE_NAME];
    const { user, accessToken, refreshToken } = await authService.refresh(incoming, req.ip);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ data: { user, accessToken } });
  },

  async logout(req: Request, res: Response) {
    const incoming = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(incoming);
    clearRefreshCookie(res);
    res.status(204).send();
  },

  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req.body.email);
    // Same response regardless of whether the email exists (prevents enumeration).
    res.status(200).json({ data: { sent: true } });
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(200).json({ data: { reset: true } });
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    res.status(200).json({ data: user });
  },
};