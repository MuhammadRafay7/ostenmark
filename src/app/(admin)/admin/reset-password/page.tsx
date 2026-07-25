"use client";

import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AdminButton,
  AdminInput,
  AdminLoading,
  AdminStatus,
} from "@/components/admin/ui";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { supabase } from "@/lib/supabase";

/** Minimum password length. Supabase enforces 6; 10 is a more defensible floor. */
const MIN_LENGTH = 10;

/**
 * Sets a new password from a recovery link.
 *
 * Supabase establishes a recovery session from the tokens in the link, so the form
 * waits for that session before allowing a change — otherwise `updateUser` would
 * fail with an opaque error. Validation messages are inline rather than `alert()`,
 * and the length requirement is stated up front instead of only after a failure.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    // Covers the case where the session is already established before we subscribe.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError("The two passwords don't match.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) setError(updateError.message);
    else setDone(true);
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
              Set a new password
            </h1>
          </header>

          {done ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col gap-5"
            >
              <div className="flex gap-3 rounded-lg border border-line bg-surface p-4">
                <ShieldCheck
                  size={17}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-positive"
                />
                <p className="text-sm text-fg-muted">
                  Your password has been updated. You can sign in with it now.
                </p>
              </div>
              <AdminButton onClick={() => router.push("/admin/login")}>
                Go to sign in
              </AdminButton>
            </div>
          ) : !ready ? (
            <div className="flex flex-col gap-5">
              <AdminLoading label="Verifying your recovery link…" />
              <p className="text-sm text-fg-muted">
                If this doesn&rsquo;t finish, the link may have expired. Request
                a fresh one from the sign-in screen.
              </p>
              <AdminButton
                variant="secondary"
                onClick={() => router.push("/admin/login")}
              >
                <ArrowLeft size={15} aria-hidden />
                Back to sign in
              </AdminButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AdminInput
                label="New password"
                type="password"
                hint={`At least ${MIN_LENGTH} characters.`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                wide
              />
              <AdminInput
                label="Confirm new password"
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                required
                wide
              />

              {error ? <AdminStatus state="error" message={error} /> : null}

              <AdminButton type="submit" busy={busy} className="mt-1 w-full">
                {busy ? "Updating…" : "Update password"}
              </AdminButton>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
