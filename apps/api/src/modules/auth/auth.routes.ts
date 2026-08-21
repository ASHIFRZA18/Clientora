import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../lib/async-handler.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "./auth.validation.js";

export const authRouter = Router();

// Stricter limiter for credential-guessing-prone endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many attempts, please try again later" } },
});

authRouter.post("/register", authLimiter, validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/verify-email", validate(verifyEmailSchema), asyncHandler(authController.verifyEmail));
authRouter.post(
  "/resend-verification",
  authLimiter,
  validate(resendVerificationSchema),
  asyncHandler(authController.resendVerification)
);
authRouter.post("/login", authLimiter, validate(loginSchema), asyncHandler(authController.login));
authRouter.get("/google", authController.googleRedirect);
authRouter.get("/google/callback", asyncHandler(authController.googleCallback));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);
authRouter.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);
authRouter.get("/me", authenticate, asyncHandler(authController.me));