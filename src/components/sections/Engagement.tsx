import { Check } from "lucide-react";

import { Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { EngagementContent } from "@/lib/types";

/**
 * How to engage us.
 *
 * Content is CMS-managed (/admin/engagement), falling back to
 * `engagementDefaults` in `src/lib/site.ts`. A prospect in another country
 * cannot start a conversation about a six-figure build without first knowing
 * what shape the commercial relationship takes — fixed scope, retainer, or a
 * paid discovery phase. Deliberately no prices: they depend on scope. Durations
 * and terms are stated, because those are the parts that don't.
 */
export default function Engagement({ content }: { content: EngagementContent }) {
  return (
    <Section id="engagement" spacing="lg">
      <SectionHeading
        eyebrow={content.heading.eyebrow}
        title={content.heading.title}
        lede={content.heading.lede}
      />

      <RevealGroup
        as="ul"
        className="mt-14 grid gap-6 lg:grid-cols-3"
      >
        {content.items.map((model) => (
          <RevealItem
            as="li"
            key={model.id}
            className="flex flex-col rounded-xl border border-line bg-surface-raised p-7 shadow-xs sm:p-8"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-fg">
                {model.name}
              </h3>
              {model.duration ? (
                <span className="label shrink-0 text-fg-subtle">{model.duration}</span>
              ) : null}
            </div>

            <p className="mt-4 text-base text-fg-muted">{model.summary}</p>

            {model.includes.length > 0 ? (
              <ul className="mt-7 flex flex-col gap-3 border-t border-line pt-6">
                {model.includes.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-fg">
                    <Check
                      size={16}
                      strokeWidth={2.25}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
