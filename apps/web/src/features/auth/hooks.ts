import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/store/session";
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  verifyEmailRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  resendVerificationRequest, // NEW — add this export to ./api/auth.api, see auth.api.patch.md
} from "./api/auth.api";

export function useRegister() {
  return useMutation({ mutationFn: registerRequest });
}

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ user, accessToken }) => {
      setSession(user, accessToken);
      navigate("/", { replace: true });
    },
  });
}

export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clearSession();
      navigate("/login", { replace: true });
    },
  });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: verifyEmailRequest });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPasswordRequest });
}

// NEW
export function useResendVerification() {
  return useMutation({ mutationFn: resendVerificationRequest });
}