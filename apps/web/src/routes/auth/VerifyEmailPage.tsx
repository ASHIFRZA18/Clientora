import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { useVerifyEmail } from "@/features/auth/hooks";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const verifyEmail = useVerifyEmail();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    verifyEmail.mutate(token, {
      onSuccess: () => setStatus("success"),
      onError: () => setStatus("error"),
    });
  }, [token, verifyEmail]);

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your account">
      <div className="rounded-lg border border-line bg-surface p-4 flex flex-col items-center text-center gap-2.5">
        {!token || status === "error" ? (
          <>
            <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-danger" />
            </div>
            <p className="text-sm text-ink">This verification link is invalid or has expired.</p>
          </>
        ) : status === "success" ? (
          <>
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm text-ink">Your email is verified.</p>
          </>
        ) : (
          <>
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm text-muted">Verifying…</p>
          </>
        )}
        <Link to="/login" className="mt-1">
          <Button variant="outline" size="sm">
            Back to sign in
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
