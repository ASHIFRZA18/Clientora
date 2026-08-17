import { isAxiosError } from "axios";

/**
 * Safely pulls `error.error.message` out of our API's standard error envelope
 * ({ error: { code, message } }) from a caught, unknown-typed error — used
 * instead of ad-hoc `as any` casts scattered across mutation error states.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

/** Same idea as getErrorMessage, but for the machine-readable `error.code`. */
export function getErrorCode(error: unknown): string | undefined {
  if (isAxiosError<{ error?: { code?: string } }>(error)) {
    return error.response?.data?.error?.code;
  }
  return undefined;
}
