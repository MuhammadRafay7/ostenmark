import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/layout";
import { commitments } from "@/lib/site";
import type { ContactInfo, HeroContent } from "@/lib/types";

/**
 * Homepage hero.
 *
 * A server component with no scroll listeners, no mouse-tracking gradient and no
 * parallax. The previous hero attached a `mousemove` handler that called
 * `setState` on every pointer event — re-rendering the whole section continuously
 * — and was 115vh tall, so the fold guaranteed nothing below it was visible.
 *
 * The content order is the one enterprise buyers actually scan: what you do, who
 * it's for, how to start, and evidence you can be relied on.
 */
export default function Hero({
  content,
  contact,
}: {
  content: HeroContent;
  contact: ContactInfo;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Blueprint grid, masked to fade out before it reaches the copy. */}
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      <Container className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-3xl">
          <Eyebrow>{content.eyebrow}</Eyebrow>

          <h1 className="mt-6 font-display text-display-xl font-semibold text-fg">
            {content.titleLead}{" "}
            <span className="text-accent">{content.titleEmphasis}</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg text-fg-muted sm:text-xl">
            {content.subtext}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href="/inquiry" size="lg">
              Start a project
              <ArrowRight size={16} aria-hidden />
            </ButtonLink>
            <ButtonLink href="/projects" size="lg" variant="secondary">
              View selected work
            </ButtonLink>
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-subtle">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-positive"
              />
              {contact.availability}
            </span>
            <span aria-hidden className="text-line-strong">
              ·
            </span>
            <span>{contact.responseTime}</span>
          </p>
        </div>
      </Container>

      {/* Operating commitments. Verifiable statements about how we work, in
          place of the invented client logos and project counts this band used to
          carry. */}
      <div className="relative border-t border-line bg-surface/60">
        <Container>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-8 py-10 lg:grid-cols-4">
            {commitments.map((item) => (
              <div key={item.label}>
                <dt className="label text-fg-subtle">{item.label}</dt>
                <dd className="mt-2 font-display text-2xl font-semibold text-fg">
                  {item.value}
                </dd>
                <dd className="mt-1.5 text-sm text-fg-muted">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
