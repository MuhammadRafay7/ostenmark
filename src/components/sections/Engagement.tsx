import { Check } from "lucide-react";

import { Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { engagementModels } from "@/lib/site";

/**
 * How to engage us.
 *
 * This section is new, and it is the one most directly aimed at the brief. A
 * prospect in another country cannot start a conversation about a six-figure
 * build without first knowing what shape the commercial relationship takes —
 * fixed scope, retainer, or a paid discovery phase. Leaving it to "contact us"
 * filters out exactly the serious buyers the site is meant to attract.
 *
 * Deliberately no prices: they depend on scope. Durations and terms are stated,
 * because those are the parts that don't.
 */
export default function Engagement() {
  return (
    <Section id="engagement" spacing="lg">
      <SectionHeading
        eyebrow="Engagement models"
        title="Ways to work with us"
        lede="Most clients start with a discovery sprint and continue into a build. Pricing depends on scope — the terms below don't."
      />

      <RevealGroup
        as="ul"
        className="mt-14 grid gap-6 lg:grid-cols-3"
      >
        {engagementModels.map((model) => (
          <RevealItem
            as="li"
            key={model.name}
            className="flex flex-col rounded-xl border border-line bg-surface-raised p-7 shadow-xs sm:p-8"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-fg">
                {model.name}
              </h3>
              <span className="label shrink-0 text-fg-subtle">{model.duration}</span>
            </div>

            <p className="mt-4 text-base text-fg-muted">{model.summary}</p>

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
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
