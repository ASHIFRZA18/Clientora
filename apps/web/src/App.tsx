import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import { useBootstrapSession } from "@/features/auth/use-bootstrap-session";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const LoginPage = lazy(() => import("@/routes/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/routes/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/routes/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/routes/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/routes/auth/VerifyEmailPage"));
const SystemStatus = lazy(() => import("@/routes/SystemStatus"));
const Dashboard = lazy(() => import("@/routes/Dashboard"));
const Customers = lazy(() => import("@/routes/Customers"));
const Leads = lazy(() => import("@/routes/Leads"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-line border-t-primary animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const isReady = useBootstrapSession();

  if (!isReady) {
    return <RouteFallback />;
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/status" element={<SystemStatus />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
