"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";

/**
 * Route-level error boundary.
 *
 * Previously absent, which meant any thrown error — a Supabase outage, a bad CMS
 * payload — produced Next.js's default error screen with none of the site's
 * chrome, and no way for the visitor to reach a contact address.
 *
 * The error message itself is deliberately not rendered: it can contain internal
 * detail, and it means nothing to a prospective client. It goes to the console
 * (and to Vercel's logs) instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <Container width="content" className="py-28 text-center sm:py-40">
      <p className="label text-fg-subtle">Something went wrong</p>
      <h1 className="mt-5 font-display text-display-md font-semibold text-fg">
        This page failed to load.
      </h1>
      <p className="mx-auto mt-5 max-w-md text-lg text-fg-muted">
        The fault is on our side, not yours. Try again — and if it keeps happening,
        we&rsquo;d genuinely like to know.
      </p>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" onClick={reset}>
          <RotateCcw size={15} aria-hidden />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>

      {error.digest ? (
        // Lets a visitor quote a reference that can be matched to a server log.
        <p className="mt-8 font-mono text-xs text-fg-subtle">
          Reference: {error.digest}
        </p>
      ) : null}
    </Container>
  );
}
