import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "@/features/auth/schema";
import { useForgotPassword } from "@/features/auth/hooks";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordFormSchema) });

  const onSubmit = (values: ForgotPasswordFormValues) =>
    forgotPassword.mutate(values.email, { onSuccess: () => setSent(true) });

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle="If that account exists, a reset link is on its way">
        <div className="rounded-lg border border-line bg-surface p-4 flex flex-col items-center text-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
            <MailCheck className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-ink">The link expires in 1 hour.</p>
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
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a link to reset it">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        <Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
