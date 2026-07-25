import { ArrowRight } from "lucide-react";
import Link from "next/link";

import ProjectCard from "@/components/ProjectCard";
import { Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { Project } from "@/lib/types";

/**
 * Featured case studies on the homepage.
 *
 * Renders nothing at all when there is no work to show, rather than an empty
 * grid with a heading over it — a visible empty state here reads as a studio
 * with nothing to point at.
 */
export default function FeaturedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <Section id="work" spacing="lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Selected work"
          title="Recent projects"
          lede="A sample of what we've shipped. Each one covers the problem, the approach and the stack it runs on."
        />

        <Link
          href="/projects"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-fg underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
        >
          All work
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <RevealGroup className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {projects.map((project, index) => (
          <RevealItem key={project.id}>
            <ProjectCard
              project={project}
              // First row is likely above the fold on desktop.
              priority={index < 2}
            />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
