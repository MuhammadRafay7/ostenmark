import { ArrowRight } from "lucide-react";

import HeroVisual from "@/components/sections/HeroVisual";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Container, Eyebrow } from "@/components/ui/layout";
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
 * it's for, and how to start.
 *
 * The operating-commitments band that used to close this section now lives only
 * on the about page, where it sits under a heading that frames it. It was
 * duplicated across both, and directly below the hero it competed with the
 * calls to action rather than supporting them.
 *
 * The entrance uses the same Reveal primitive as the rest of the site, in its
 * `immediate` mode — the hero is above the fold, so it animates on mount rather
 * than on intersection. Everything here still renders on the server; only the
 * Reveal wrappers are client components, so the copy is in the HTML and the
 * animation is decoration on top of it. `useReducedMotion` inside Reveal turns
 * the whole chain off, and the two CSS animations are covered by the global
 * reduced-motion override.
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
      <div
        aria-hidden
        className="bg-grid animate-grid-in pointer-events-none absolute inset-0 opacity-60"
      />

      <Container className="relative grid items-center gap-12 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16 lg:pt-32 lg:pb-24">
        {/* Slightly wider stagger than the site default: five elements at 0.07s
            finish before the eye has read the headline, which wastes the cue. */}
        <RevealGroup immediate stagger={0.09} className="max-w-3xl">
          <RevealItem>
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </RevealItem>

          <RevealItem>
            <h1 className="mt-6 font-display text-display-xl font-semibold text-fg">
              {content.titleLead}{" "}
              <span className="text-accent">{content.titleEmphasis}</span>
            </h1>
          </RevealItem>

          <RevealItem>
            <p className="mt-7 max-w-2xl text-lg text-fg-muted sm:text-xl">
              {content.subtext}
            </p>
          </RevealItem>

          <RevealItem className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href="/inquiry" size="lg">
              Start a project
              <ArrowRight size={16} aria-hidden />
            </ButtonLink>
            <ButtonLink href="/projects" size="lg" variant="secondary">
              View selected work
            </ButtonLink>
          </RevealItem>

          <RevealItem className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-subtle">
            <span className="flex items-center gap-2">
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                <span className="animate-halo absolute inset-0 rounded-full bg-positive" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-positive" />
              </span>
              {contact.availability}
            </span>
            <span aria-hidden className="text-line-strong">
              ·
            </span>
            <span>{contact.responseTime}</span>
          </RevealItem>
        </RevealGroup>

        {/* Arrives after the copy has finished landing — it is the least
            important thing on screen and should not compete with the headline
            for the first second. */}
        {/* No `justify-self-end` here. That makes the grid item shrink-to-fit,
            and every child of HeroVisual is absolutely positioned — so the item
            measured 0 wide, the visual's `w-full` resolved to 0, and the canvas
            got a zero-size drawing buffer. The item stretches to the column and
            the visual right-aligns itself inside it instead. */}
        <Reveal immediate delay={0.5} className="hidden lg:block">
          <HeroVisual />
        </Reveal>
      </Container>
    </section>
  );
}
