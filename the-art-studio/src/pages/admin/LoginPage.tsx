import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  useAuth,
} from "../../lib/admin/AuthProvider";
import { Field, Input } from "../../components/admin/ui/Form";

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ??
    "/admin/dashboard";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige/50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-olive text-ivory">
            <span className="font-display text-xl leading-none">A</span>
          </span>
          <h1 className="mt-4 font-display text-2xl text-ink">
            The Art Studio
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to the admin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-ink/10 bg-ivory p-6 shadow-sm"
        >
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay-deep"
            >
              {error}
            </div>
          )}

          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
            />
          </Field>

          <Field label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-olive px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-olive-deep disabled:opacity-60"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/40 border-t-ivory" />
            )}
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="rounded-xl bg-beige/60 px-4 py-3 text-center text-xs text-ink-soft">
            Demo — use password{" "}
            <span className="font-medium text-ink">{DEMO_PASSWORD}</span> (any
            email works)
          </p>
        </form>
      </div>
    </div>
  );
}
