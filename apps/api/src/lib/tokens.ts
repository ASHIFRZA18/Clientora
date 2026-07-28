import { randomBytes, createHash } from "crypto";

/** Generates a URL-safe random token. Return the raw token to the client/email link,
 *  store only the hash in the database — never persist the raw value. */
export function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
