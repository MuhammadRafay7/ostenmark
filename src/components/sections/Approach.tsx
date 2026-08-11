import { Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { ApproachContent } from "@/lib/types";

/**
 * How we work.
 *
 * Content is CMS-managed (/admin/approach), falling back to `approachDefaults`
 * in `src/lib/site.ts`. Each phase names a *deliverable* rather than an activity:
 * "we design the interface" tells a buyer nothing they can hold us to; "clickable
 * prototype and a component inventory" does. The step number is derived from
 * order, so reordering in the admin renumbers the phases automatically.
 */
export default function Approach({ content }: { content: ApproachContent }) {
  return (
    <Section id="approach" spacing="lg" surface>
      <SectionHeading
        eyebrow={content.heading.eyebrow}
        title={content.heading.title}
        lede={content.heading.lede}
      />

      <RevealGroup as="ol" className="mt-14 grid gap-px bg-line lg:grid-cols-4">
        {content.items.map((phase, index) => (
          <RevealItem
            as="li"
            key={phase.id}
            className="flex flex-col bg-surface p-7 lg:p-8"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span
                aria-hidden
                className="font-mono text-sm font-medium text-accent"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {phase.duration ? (
                <span className="label text-fg-subtle">{phase.duration}</span>
              ) : null}
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold text-fg">
              {phase.title}
            </h3>

            <p className="mt-3 text-sm text-fg-muted">{phase.summary}</p>

            {phase.deliverable ? (
              <div className="mt-6 border-t border-line pt-4">
                <p className="label text-fg-subtle">You receive</p>
                <p className="mt-1.5 text-sm font-medium text-fg">
                  {phase.deliverable}
                </p>
              </div>
            ) : null}
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
