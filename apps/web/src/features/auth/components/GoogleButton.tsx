// Place at: apps/web/src/features/auth/components/GoogleButton.tsx
//
// This is a plain <a> tag, not a JS click handler — Google OAuth needs a
// real full-page navigation to your backend's /auth/google route, which
// then redirects to Google's consent screen. A fetch() or SPA-style
// navigation won't work here.

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export function GoogleButton() {
  return (
    <a
      href={`${API_BASE_URL}/auth/google`}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface transition-colors"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.09 3.55-5.17 3.55-8.65z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.25 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.6H1.28A11.96 11.96 0 000 12c0 1.93.47 3.76 1.28 5.4l3.99-3.11z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.6l3.99 3.11C6.22 6.86 8.87 4.75 12 4.75z"
        />
      </svg>
      Continue with Google
    </a>
  );
}