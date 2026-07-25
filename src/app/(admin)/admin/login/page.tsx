"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminButton, AdminInput, AdminStatus } from "@/components/admin/ui";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { supabase } from "@/lib/supabase";

/**
 * Admin sign-in, with password recovery in the same screen.
 *
 * Errors are shown inline rather than through `alert()`. Note the deliberately
 * generic failure message: Supabase distinguishes "user not found" from "wrong
 * password", and surfacing that difference lets anyone enumerate valid admin
 * addresses. The recovery flow reports success regardless of whether the address
 * exists, for the same reason.
 */

type Mode = "signin" | "recover";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("That email and password combination isn't right.");
      setBusy(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  async function handleRecover(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    // Always reported as sent — see the note above.
    setSent(true);
    setBusy(false);
  }

  function switchTo(next: Mode) {
    setMode(next);
    setSent(false);
    setPassword("");
    setError(null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-4">
        {/* These screens render outside the admin shell, so they carry their own
            theme control — someone signing in shouldn't have to go elsewhere. */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="rounded-xl border border-line bg-surface-raised p-7 shadow-lg">
          <header className="mb-6">
            <h1 className="font-display text-xl font-semibold text-fg">
              {mode === "signin" ? "Sign in" : "Reset your password"}
            </h1>
            <p className="mt-1.5 text-sm text-fg-muted">
              {mode === "signin"
                ? "Access the content manager."
                : "We'll email you a link to set a new password."}
            </p>
          </header>

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <AdminInput
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                wide
              />
              <AdminInput
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                wide
              />

              {error ? <AdminStatus state="error" message={error} /> : null}

              <AdminButton type="submit" busy={busy} className="mt-1 w-full">
                {busy ? "Signing in…" : "Sign in"}
              </AdminButton>

              <button
                type="button"
                onClick={() => switchTo("recover")}
                className="text-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg"
              >
                Forgot your password?
              </button>
            </form>
          ) : sent ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col gap-5"
            >
              <div className="flex gap-3 rounded-lg border border-line bg-surface p-4">
                <MailCheck
                  size={17}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-positive"
                />
                <p className="text-sm text-fg-muted">
                  If an account exists for{" "}
                  <span className="font-medium text-fg">{email}</span>, a reset
                  link is on its way. Check your inbox and spam folder.
                </p>
              </div>
              <AdminButton
                variant="secondary"
                onClick={() => switchTo("signin")}
              >
                <ArrowLeft size={15} aria-hidden />
                Back to sign in
              </AdminButton>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="flex flex-col gap-4">
              <AdminInput
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                wide
              />

              <AdminButton type="submit" busy={busy} className="mt-1 w-full">
                {busy ? "Sending…" : "Send reset link"}
              </AdminButton>

              <button
                type="button"
                onClick={() => switchTo("signin")}
                className="inline-flex items-center justify-center gap-1.5 text-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg"
              >
                <ArrowLeft size={13} aria-hidden />
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
