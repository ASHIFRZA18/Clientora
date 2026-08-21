import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { loginFormSchema, type LoginFormValues } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/hooks";
import { getErrorMessage } from "@/lib/get-error-message";
import { GoogleButton } from "@/features/auth/components/GoogleButton";

export default function LoginPage() {
  const login = useLogin();
  const [params] = useSearchParams();
  const googleFailed = params.get("error") === "google_auth_failed";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = (values: LoginFormValues) => login.mutate(values);

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your workspace">
      <GoogleButton />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-canvas px-2 text-muted">or</span>
        </div>
      </div>

      {googleFailed && (
        <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger mb-3.5">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Google sign-in failed. Please try again or use your email and password.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <div className="space-y-1">
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Link to="/forgot-password" className="inline-block text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {login.isError && (
          <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              {getErrorMessage(login.error)}
            </span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}