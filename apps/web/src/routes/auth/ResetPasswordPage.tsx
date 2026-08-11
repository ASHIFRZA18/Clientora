import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPasswordFormSchema, type ResetPasswordFormValues } from "@/features/auth/schema";
import { useResetPassword } from "@/features/auth/hooks";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  const onSubmit = (values: ResetPasswordFormValues) =>
    resetPassword.mutate(
      { token, password: values.password },
      { onSuccess: () => setDone(true) }
    );

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing its token">
        <Link to="/forgot-password">
          <Button variant="outline" className="w-full">
            Request a new link
          </Button>
        </Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now sign in with your new password">
        <div className="rounded-lg border border-line bg-surface p-4 flex flex-col items-center text-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <Button onClick={() => navigate("/login")} size="sm">
            Sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Make it something you'll remember">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {resetPassword.isError && (
          <div className="flex items-start gap-1.5 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              {(resetPassword.error as any)?.response?.data?.error?.message ??
                "This link may have expired. Request a new one."}
            </span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
          {resetPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
