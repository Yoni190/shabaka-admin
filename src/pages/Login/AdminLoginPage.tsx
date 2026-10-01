import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../../components/ui/FormField";
import { isForbidden, isUnauthorized, isValidationError } from "../../lib/axios";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import type { AdminLoginFieldErrors, AdminLoginPayload } from "../../types";

const emptyForm: AdminLoginPayload = {
  email: "",
  password: "",
};

export default function AdminLoginPage() {
  const [form, setForm] = useState<AdminLoginPayload>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<AdminLoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const updateField = (field: keyof AdminLoginPayload) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      await login(form);
      navigate("/admin");
    } catch (error) {
      if (isValidationError(error)) {
        const { errors, message } = error.response.data;
        const flattened: AdminLoginFieldErrors = {};
        for (const [field, messages] of Object.entries(errors)) {
          flattened[field as keyof AdminLoginPayload] = messages[0];
        }
        setFieldErrors(flattened);
        setFormError(message ?? "Please correct the highlighted fields.");
      } else if (isUnauthorized(error)) {
        setFormError(
          error.response.data.message ?? "Invalid email or password.",
        );
      } else if (isForbidden(error)) {
        setFormError(
          error.response.data.message ??
            "This account does not have admin access.",
        );
      } else {
        setFormError("We couldn't sign you in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Brand panel — hidden on mobile */}
      <aside className="relative hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex lg:p-12">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <path d="M10 6.5h4a3 3 0 0 1 3 3V14" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Shabaka
          </span>
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-300">
            Admin
          </span>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manage your store, orders and customers.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            The Shabaka admin portal gives internal teams full control over the
            networking equipment catalogue, stock levels, and business accounts.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              "Catalogue and inventory management",
              "Order review and fulfilment",
              "Customer and business approvals",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">
          Internal use only · Shabaka © {new Date().getFullYear()}
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Compact brand mark for mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <path d="M10 6.5h4a3 3 0 0 1 3 3V14" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Shabaka
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              Admin
            </span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Admin portal
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Authorised staff only. Use your Shabaka admin credentials.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <FormField
              id="email"
              label="Admin email"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              error={fieldErrors.email}
              required
              autoComplete="email"
              placeholder="admin@shabaka.com"
            />

            <div>
              <FormField
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={updateField("password")}
                error={fieldErrors.password}
                required
                autoComplete="current-password"
              />
              <div className="mt-2 text-right">
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Not an admin?{" "}
            <Link
              to="/"
              className="font-medium text-slate-600 underline-offset-4 hover:underline"
            >
              Return to dashboard
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}