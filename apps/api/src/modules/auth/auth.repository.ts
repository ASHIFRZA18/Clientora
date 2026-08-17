import { prisma } from "../../lib/prisma.js";

export const authRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findByGoogleId: (googleId: string) => prisma.user.findUnique({ where: { googleId } }),

  createGoogleUser: (data: { name: string; email: string; googleId: string }) =>
    prisma.user.create({
      data: { name: data.name, email: data.email, googleId: data.googleId, isVerified: true },
    }),

  linkGoogleId: (userId: string, googleId: string) =>
    prisma.user.update({ where: { id: userId }, data: { googleId } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  create: (data: { name: string; email: string; passwordHash: string }) =>
    prisma.user.create({ data }),

  setEmailVerifyToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.user.update({
      where: { id: userId },
      data: { emailVerifyTokenHash: tokenHash, emailVerifyExpires: expiresAt },
    }),

  findByEmailVerifyTokenHash: (tokenHash: string) =>
    prisma.user.findFirst({
      where: { emailVerifyTokenHash: tokenHash, emailVerifyExpires: { gt: new Date() } },
    }),

  markVerified: (userId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { isVerified: true, emailVerifyTokenHash: null, emailVerifyExpires: null },
    }),

  setPasswordResetToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.user.update({
      where: { id: userId },
      data: { passwordResetTokenHash: tokenHash, passwordResetExpires: expiresAt },
    }),

  findByPasswordResetTokenHash: (tokenHash: string) =>
    prisma.user.findFirst({
      where: { passwordResetTokenHash: tokenHash, passwordResetExpires: { gt: new Date() } },
    }),

  updatePassword: (userId: string, passwordHash: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordResetTokenHash: null, passwordResetExpires: null },
    }),

  createRefreshToken: (data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdByIp?: string;
  }) => prisma.refreshToken.create({ data }),

  findRefreshTokenByHash: (tokenHash: string) =>
    prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } }),

  revokeRefreshToken: (id: string, replacedById?: string) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedById },
    }),

  revokeAllRefreshTokensForUser: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
};
