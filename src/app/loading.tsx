import { Container } from "@/components/ui/layout";

/**
 * Route-level loading skeleton.
 *
 * Shape-matched to the standard page header (eyebrow, headline, lede) so the
 * transition into real content doesn't shift the layout. Announced politely
 * rather than assertively — a visitor using a screen reader should hear that
 * something is loading, not have it interrupt them.
 */
export default function Loading() {
  return (
    <Container className="py-16 sm:py-20 lg:py-24" aria-busy="true">
      <div role="status" aria-live="polite" className="max-w-2xl">
        <span className="sr-only">Loading page…</span>

        <div className="h-3 w-28 animate-pulse rounded-full bg-surface-sunken" />
        <div className="mt-7 flex flex-col gap-3">
          <div className="h-11 w-full animate-pulse rounded-lg bg-surface-sunken" />
          <div className="h-11 w-3/5 animate-pulse rounded-lg bg-surface-sunken" />
        </div>
        <div className="mt-7 flex flex-col gap-2.5">
          <div className="h-4 w-full animate-pulse rounded bg-surface-sunken" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-surface-sunken" />
        </div>
      </div>

      <div aria-hidden className="mt-16 grid gap-8 sm:grid-cols-2">
        {[0, 1].map((key) => (
          <div key={key} className="flex flex-col gap-4">
            <div className="aspect-16/10 w-full animate-pulse rounded-lg bg-surface-sunken" />
            <div className="h-4 w-2/5 animate-pulse rounded bg-surface-sunken" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-surface-sunken" />
          </div>
        ))}
      </div>
    </Container>
  );
}
