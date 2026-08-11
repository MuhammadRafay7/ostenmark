import { Section, SectionHeading, Tag } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { resolveIcon } from "@/lib/icons";
import type { ServicesContent } from "@/lib/types";

/**
 * What we do.
 *
 * Content is CMS-managed (/admin/services), falling back to `servicesDefaults`
 * in `src/lib/site.ts` when the row is empty. The per-service `outcome` line
 * exists because buyers evaluating a vendor need to know what they get, not just
 * which technologies are involved.
 */
export default function Services({ content }: { content: ServicesContent }) {
  return (
    <Section id="services" spacing="lg">
      <SectionHeading
        eyebrow={content.heading.eyebrow}
        title={content.heading.title}
        lede={content.heading.lede}
      />

      <RevealGroup
        as="ul"
        className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2"
      >
        {content.items.map((service) => {
          const Icon = resolveIcon(service.icon);
          return (
            <RevealItem
              as="li"
              key={service.id}
              className="flex flex-col bg-canvas p-7 sm:p-9"
            >
              <Icon
                size={20}
                strokeWidth={1.75}
                aria-hidden
                className="text-accent"
              />

              <h3 className="mt-5 font-display text-xl font-semibold text-fg">
                {service.title}
              </h3>

              <p className="mt-3 text-base text-fg-muted">{service.summary}</p>

              {service.outcome ? (
                <p className="mt-5 border-l-2 border-accent pl-4 text-sm font-medium text-fg">
                  {service.outcome}
                </p>
              ) : null}

              {service.stack.length > 0 ? (
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-7">
                  {service.stack.map((tech) => (
                    <li key={tech}>
                      <Tag>{tech}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
