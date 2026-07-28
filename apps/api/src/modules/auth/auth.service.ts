import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository.js";
import { signAccessToken } from "../../lib/jwt.js";
import { generateRawToken, hashToken } from "../../lib/tokens.js";
import { sendEmail } from "../../lib/mailer.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 1 * 60 * 60 * 1000;

function publicUser(user: { id: string; name: string; email: string; role: string; isVerified: boolean }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified };
}

async function issueRefreshToken(userId: string, ip?: string) {
  const raw = generateRawToken();
  await authRepository.createRefreshToken({
    userId,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    createdByIp: ip,
  });
  return raw;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, "EMAIL_IN_USE", "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const rawToken = generateRawToken();
    await authRepository.setEmailVerifyToken(
      user.id,
      hashToken(rawToken),
      new Date(Date.now() + VERIFY_TOKEN_TTL_MS)
    );

    await sendEmail({
      to: user.email,
      subject: "Verify your Meridian CRM account",
      body: `Verify your email: http://localhost:5173/verify-email?token=${rawToken}`,
    });

    return publicUser(user);
  },

  async verifyEmail(token: string) {
    const user = await authRepository.findByEmailVerifyTokenHash(hashToken(token));
    if (!user) {
      throw new ApiError(400, "INVALID_TOKEN", "This verification link is invalid or has expired");
    }
    await authRepository.markVerified(user.id);
  },

  async login(input: LoginInput, ip?: string) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const refreshToken = await issueRefreshToken(user.id, ip);

    return { user: publicUser(user), accessToken, refreshToken };
  },

  async refresh(rawToken: string | undefined, ip?: string) {
    if (!rawToken) {
      throw new ApiError(401, "UNAUTHORIZED", "No refresh token provided");
    }

    const tokenHash = hashToken(rawToken);
    const record = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!record) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    if (record.revokedAt) {
      // Reuse of a rotated/revoked token — possible theft. Kill the whole session family.
      await authRepository.revokeAllRefreshTokensForUser(record.userId);
      throw new ApiError(401, "TOKEN_REUSE_DETECTED", "Session invalidated, please log in again");
    }

    if (record.expiresAt < new Date()) {
      throw new ApiError(401, "UNAUTHORIZED", "Refresh token expired");
    }

    const newRawToken = generateRawToken();
    const newRecord = await authRepository.createRefreshToken({
      userId: record.userId,
      tokenHash: hashToken(newRawToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      createdByIp: ip,
    });
    await authRepository.revokeRefreshToken(record.id, newRecord.id);

    const accessToken = signAccessToken({
      sub: record.user.id,
      role: record.user.role,
      email: record.user.email,
    });

    return { user: publicUser(record.user), accessToken, refreshToken: newRawToken };
  },

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;
    const record = await authRepository.findRefreshTokenByHash(hashToken(rawToken));
    if (record && !record.revokedAt) {
      await authRepository.revokeRefreshToken(record.id);
    }
  },

  async forgotPassword(email: string) {
    const user = await authRepository.findByEmail(email);
    // Always behave the same way whether or not the user exists, to avoid leaking which emails are registered.
    if (user) {
      const rawToken = generateRawToken();
      await authRepository.setPasswordResetToken(
        user.id,
        hashToken(rawToken),
        new Date(Date.now() + RESET_TOKEN_TTL_MS)
      );
      await sendEmail({
        to: user.email,
        subject: "Reset your Meridian CRM password",
        body: `Reset your password: http://localhost:5173/reset-password?token=${rawToken}\nThis link expires in 1 hour.`,
      });
    }
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await authRepository.findByPasswordResetTokenHash(hashToken(token));
    if (!user) {
      throw new ApiError(400, "INVALID_TOKEN", "This reset link is invalid or has expired");
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await authRepository.updatePassword(user.id, passwordHash);
    await authRepository.revokeAllRefreshTokensForUser(user.id);
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }
    return publicUser(user);
  },
};
