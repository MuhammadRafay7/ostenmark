import { Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

/**
 * How we work.
 *
 * Each phase names a *deliverable* rather than an activity. "We design the
 * interface" tells a buyer nothing they can hold us to; "clickable prototype and
 * a component inventory" does. Procurement reads this section looking for exactly
 * that distinction.
 */
const phases = [
  {
    step: "01",
    title: "Scope",
    duration: "1–2 weeks",
    summary:
      "We establish what is actually being built and what it depends on — users, constraints, existing systems, and the parts nobody has decided yet.",
    deliverable: "Technical plan, architecture outline, and a costed estimate.",
  },
  {
    step: "02",
    title: "Design",
    duration: "2–4 weeks",
    summary:
      "Interface and data model together, validated with you before implementation. Direction is agreed on screens, not on descriptions of screens.",
    deliverable: "Clickable prototype and a reviewed component inventory.",
  },
  {
    step: "03",
    title: "Build",
    duration: "4–12 weeks",
    summary:
      "Delivery in weekly increments against the agreed milestones. You see working software each week and can redirect while it is still cheap to do so.",
    deliverable: "Weekly demo, staging environment, and a tested main branch.",
  },
  {
    step: "04",
    title: "Launch & support",
    duration: "Ongoing",
    summary:
      "Deployment, monitoring and the unglamorous work of the first weeks in production — then continued support on terms you can exit.",
    deliverable: "Production release, runbook, handover, and a support agreement.",
  },
];

export default function Approach() {
  return (
    <Section id="approach" spacing="lg" surface>
      <SectionHeading
        eyebrow="Approach"
        title="A process you can hold us to"
        lede="Four phases, each ending in something concrete you receive. No phase depends on trust that the next one will go well."
      />

      <RevealGroup as="ol" className="mt-14 grid gap-px bg-line lg:grid-cols-4">
        {phases.map((phase) => (
          <RevealItem
            as="li"
            key={phase.step}
            className="flex flex-col bg-surface p-7 lg:p-8"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span
                aria-hidden
                className="font-mono text-sm font-medium text-accent"
              >
                {phase.step}
              </span>
              <span className="label text-fg-subtle">{phase.duration}</span>
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold text-fg">
              {phase.title}
            </h3>

            <p className="mt-3 text-sm text-fg-muted">{phase.summary}</p>

            <div className="mt-6 border-t border-line pt-4">
              <p className="label text-fg-subtle">You receive</p>
              <p className="mt-1.5 text-sm font-medium text-fg">
                {phase.deliverable}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
