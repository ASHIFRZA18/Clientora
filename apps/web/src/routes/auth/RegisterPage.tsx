import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerFormSchema, type RegisterFormValues } from "@/features/auth/schema";
import { useRegister } from "@/features/auth/hooks";
import { getErrorMessage } from "@/lib/get-error-message";
import { GoogleButton } from "@/features/auth/components/GoogleButton";

export default function RegisterPage() {
  const registerUser = useRegister();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = (values: RegisterFormValues) =>
    registerUser.mutate(values, { onSuccess: () => setSubmittedEmail(values.email) });

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
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />

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