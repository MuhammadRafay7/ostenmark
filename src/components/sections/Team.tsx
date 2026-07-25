import { Github, Linkedin } from "lucide-react";
import Image from "next/image";

import { Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { TeamContent } from "@/lib/types";

/**
 * Team section for the About page.
 *
 * **Renders nothing when there are no members.** That is the point of the
 * component: the studio is a solo operation presenting as a studio, so it must be
 * possible to have no team section at all rather than a one-person "Our team" —
 * which reads worse to a prospective client than saying nothing. Adding people at
 * /admin/team makes the section appear; removing them makes it disappear.
 *
 * Headings and intro copy come from the CMS with defaults, so the section is
 * usable immediately after the first member is added.
 */
export default function Team({ content }: { content: TeamContent }) {
  if (content.members.length === 0) return null;

  const single = content.members.length === 1;

  return (
    <Section id="team" spacing="md">
      <SectionHeading
        eyebrow="Team"
        title={content.heading || "The people you'll work with"}
        lede={
          content.intro ||
          "No account managers between you and the people writing the code."
        }
      />

      <RevealGroup
        as="ul"
        className={
          // A single member in a 3-up grid looks like an incomplete page, so the
          // layout adapts to how many people there actually are.
          single
            ? "mt-12 grid max-w-xl gap-8"
            : "mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {content.members.map((member) => (
          <RevealItem as="li" key={member.id} className="flex flex-col">
            {member.photoUrl ? (
              <div className="relative mb-5 aspect-square w-full max-w-56 overflow-hidden rounded-xl border border-line bg-surface">
                <Image
                  src={member.photoUrl}
                  alt={`${member.name}, ${member.role || "team member"}`}
                  fill
                  sizes="(min-width: 1024px) 224px, (min-width: 640px) 40vw, 60vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                aria-hidden
                className="mb-5 grid aspect-square w-full max-w-56 place-items-center rounded-xl border border-line bg-surface font-display text-4xl font-semibold text-fg-subtle"
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h3 className="font-display text-lg font-semibold text-fg">
              {member.name}
            </h3>
            {member.role ? (
              <p className="mt-0.5 text-sm text-accent">{member.role}</p>
            ) : null}
            {member.bio ? (
              <p className="mt-3 text-base text-fg-muted">{member.bio}</p>
            ) : null}

            {member.linkedinUrl || member.githubUrl ? (
              <ul className="mt-4 flex items-center gap-1">
                {member.linkedinUrl ? (
                  <li>
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                    >
                      <Linkedin size={15} aria-hidden />
                      <span className="sr-only">{member.name} on LinkedIn</span>
                    </a>
                  </li>
                ) : null}
                {member.githubUrl ? (
                  <li>
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface hover:text-fg"
                    >
                      <Github size={15} aria-hidden />
                      <span className="sr-only">{member.name} on GitHub</span>
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
