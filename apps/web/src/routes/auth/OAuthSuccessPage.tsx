// Place at: apps/web/src/routes/auth/OAuthSuccessPage.tsx
//
// The backend's googleCallback controller redirects here as:
//   ${webOrigin}/oauth-success?token=${accessToken}
// It only sends the access token, not the user object — so this page
// calls GET /auth/me with that token to load the user, then saves both
// into the session store exactly like useLogin does.
//
// NOTE: this uses a plain fetch() with an explicit Authorization header
// rather than your shared API client, since I don't have that file. If
// your API client already attaches the token from the session store
// automatically, you may prefer to call setSession() first (with a
// placeholder/no user) then use your normal `useMe`-style query instead.
// Swap this out for whatever matches your actual api-client.ts.

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { useSessionStore } from "@/store/session";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

async function fetchCurrentUser(token: string) {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to load user profile");
  }
  const json = await res.json();
  return json.data;
}

export default function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const setSession = useSessionStore((s) => s.setSession);
  const [status, setStatus] = useState<"pending" | "error">("pending");
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    fetchCurrentUser(token)
      .then((user) => {
        setSession(user, token);
        navigate("/", { replace: true });
      })
      .catch(() => setStatus("error"));
  }, [token, navigate, setSession]);

  if (!token || status === "error") {
    return (
      <AuthLayout title="Sign-in failed" subtitle="We couldn't complete Google sign-in">
        <div className="rounded-lg border border-line bg-surface p-4 flex flex-col items-center text-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-danger" />
          </div>
          <p className="text-sm text-ink">Something went wrong signing in with Google. Please try again.</p>
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
    <AuthLayout title="Signing you in" subtitle="Just a moment">
      <div className="flex flex-col items-center gap-2.5 py-4">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-sm text-muted">Completing Google sign-in…</p>
      </div>
    </AuthLayout>
  );
}