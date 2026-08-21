// Replaces: apps/web/src/routes/auth/RegisterPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Copy, Loader2, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { Button } from "@/components/ui/Button";
import { registerFormSchema, type RegisterFormValues } from "@/features/auth/schema";
import { useRegister, useResendVerification } from "@/features/auth/hooks";
import { getErrorMessage } from "@/lib/get-error-message";
import { GoogleButton } from "@/features/auth/components/GoogleButton";

const RESEND_COOLDOWN_SECONDS = 45;

export default function RegisterPage() {
  const registerUser = useRegister();
  const resendVerification = useResendVerification();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const passwordValue = watch("password") ?? "";

  const onSubmit = (values: RegisterFormValues) =>
    registerUser.mutate(values, {
      onSuccess: (response) => {
        setSubmittedEmail(values.email);
        setDevLink(response.data.devVerificationUrl);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (!submittedEmail || cooldown > 0) return;
    resendVerification.mutate(submittedEmail, {
      onSuccess: (response) => {
        setDevLink(response.data.devVerificationUrl);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    });
  };

  const handleCopyLink = async () => {
    if (!devLink) return;
    await navigator.clipboard.writeText(devLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (submittedEmail) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One more step to activate your account">
        <div className="rounded-lg border border-line bg-surface p-4 flex flex-col items-center text-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <MailCheck className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-ink">
            We sent a verification link to <span className="font-medium">{submittedEmail}</span>.
          </p>
          <p className="text-xs text-muted">Click the link to activate your account, then sign in.</p>

          {/* Dev-only helper — the backend only includes devVerificationUrl outside
              production, so this section is naturally absent in a real deployment. */}
          {devLink && (
            <div className="w-full mt-1 rounded-md border border-dashed border-line bg-canvas p-2.5 text-left">
              <p className="text-[11px] font-medium text-muted uppercase tracking-wide mb-1">
                Dev mode — no email service configured
              </p>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 truncate text-[11px] text-ink bg-surface rounded px-2 py-1 border border-line">
                  {devLink}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyLink} type="button">
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <a href={devLink} className="inline-block mt-2 text-xs text-primary font-medium hover:underline">
                Open verification link →
              </a>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0 || resendVerification.isPending}
            type="button"
            className="mt-1"
          >
            {resendVerification.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend verification email"}
          </Button>

          <Link to="/login" className="mt-1">
            <Button variant="outline" size="sm">
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Set up your Meridian workspace in a minute">
      <GoogleButton />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-canvas px-2 text-muted">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input label="Full name" autoComplete="name" {...register("name")} error={errors.name?.message} />
        <Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <div className="space-y-1.5">
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        {registerUser.isError && (
          <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              {getErrorMessage(registerUser.error)}
            </span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={registerUser.isPending}>
          {registerUser.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}