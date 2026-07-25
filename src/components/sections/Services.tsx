import { Boxes, Cloud, Layout, Smartphone } from "lucide-react";

import { Section, SectionHeading, Tag } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

/**
 * What we do.
 *
 * Static content by design: these are the studio's actual disciplines, and they
 * should change through review rather than a CMS text field. The per-service
 * `outcome` line exists because buyers evaluating a vendor need to know what they
 * get, not just which technologies are involved.
 */
const services = [
  {
    title: "Web platforms",
    icon: Layout,
    summary:
      "Customer-facing products and internal tools built as one coherent system — server-rendered, fast on a mid-range phone, and maintainable by whoever inherits it.",
    outcome: "A production application your team can extend without a rewrite.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "APIs & infrastructure",
    icon: Cloud,
    summary:
      "The parts that decide whether a product survives its own growth: data modelling, authentication, background work, and deployment that is reproducible rather than remembered.",
    outcome: "Infrastructure documented well enough to hand over.",
    stack: ["Node.js", "PostgreSQL", "Supabase", "Redis"],
  },
  {
    title: "Mobile applications",
    icon: Smartphone,
    summary:
      "Cross-platform apps from a single codebase, released to both stores. One team, one set of business logic, and no drift between the iOS and Android experience.",
    outcome: "Shipped to the App Store and Play Store, with release tooling in place.",
    stack: ["React Native", "Expo", "iOS", "Android"],
  },
  {
    title: "Systems integration",
    icon: Boxes,
    summary:
      "Payments, identity, messaging and the third-party services a real business already runs on — wired in with the failure cases handled, not just the happy path.",
    outcome: "Integrations with retries, reconciliation and audit trails.",
    stack: ["Stripe", "OAuth / SSO", "Webhooks", "Twilio"],
  },
];

export default function Services() {
  return (
    <Section id="services" spacing="lg">
      <SectionHeading
        eyebrow="Services"
        title="What we build"
        lede="Four disciplines, one team. Most engagements draw on more than one — a platform needs infrastructure, and infrastructure needs someone accountable for the interface on top of it."
      />

      <RevealGroup
        as="ul"
        className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2"
      >
        {services.map((service) => (
          <RevealItem
            as="li"
            key={service.title}
            className="flex flex-col bg-canvas p-7 sm:p-9"
          >
            <service.icon
              size={20}
              strokeWidth={1.75}
              aria-hidden
              className="text-accent"
            />

            <h3 className="mt-5 font-display text-xl font-semibold text-fg">
              {service.title}
            </h3>

            <p className="mt-3 text-base text-fg-muted">{service.summary}</p>

            <p className="mt-5 border-l-2 border-accent pl-4 text-sm font-medium text-fg">
              {service.outcome}
            </p>

            <ul className="mt-auto flex flex-wrap gap-1.5 pt-7">
              {service.stack.map((tech) => (
                <li key={tech}>
                  <Tag>{tech}</Tag>
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
