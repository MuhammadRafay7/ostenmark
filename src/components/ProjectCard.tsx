import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import FadeImage from "@/components/ui/FadeImage";
import { Tag } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";

/**
 * Case-study card, shared by the homepage and the work index.
 *
 * Now a server component using `next/image`. The previous version was a client
 * component that rendered a raw `<motion.img>` — no responsive `srcset`, no
 * dimensions, no lazy-loading policy — while running a per-pointer-event 3D tilt
 * with two spring animations. Cover images come from Supabase storage and can be
 * multi-megabyte originals, so serving them unoptimised was the single largest
 * payload on the site.
 *
 * The whole card is one link. Nested interactive elements inside a card link are
 * invalid HTML and produce duplicate tab stops, so the "live site" link lives on
 * the case-study page instead.
 */
export default function ProjectCard({
  project,
  priority = false,
  className,
}: {
  project: Project;
  /** Set on above-the-fold cards so the LCP image isn't lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <article className={cn("group", className)}>
      <Link
        href={`/projects/${project.id}`}
        className="flex h-full flex-col rounded-lg outline-offset-4"
      >
        <div className="relative aspect-16/10 overflow-hidden rounded-lg border border-line bg-surface">
          {project.coverImage ? (
            <FadeImage
              src={project.coverImage}
              // The card's heading names the project, so alt text repeating it
              // would be announced twice. Describe the image's role instead.
              alt={`${project.title} — project screenshot`}
              fill
              sizes="(min-width: 1024px) 46vw, (min-width: 640px) 90vw, 100vw"
              priority={priority}
              className="object-cover transition-transform duration-700 ease-out-quint group-hover:scale-[1.02]"
            />
          ) : (
            <div
              aria-hidden
              className="grid h-full place-items-center font-display text-4xl font-semibold text-line-strong"
            >
              {project.title.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <p className="label text-fg-subtle">{project.category}</p>

          <h3 className="mt-2.5 flex items-start gap-1.5 font-display text-xl font-semibold text-fg">
            <span className="transition-colors group-hover:text-accent">
              {project.title}
            </span>
            <ArrowUpRight
              size={16}
              aria-hidden
              className="mt-1 shrink-0 text-fg-subtle transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </h3>

          {project.description ? (
            <p
              className="line-clamp-dynamic mt-2.5 text-base text-fg-muted"
              style={{ "--lines": 2 } as CSSProperties}
            >
              {project.description}
            </p>
          ) : null}

          {project.stack.length > 0 ? (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
              {project.stack.slice(0, 4).map((tech) => (
                <li key={tech}>
                  <Tag>{tech}</Tag>
                </li>
              ))}
              {project.stack.length > 4 ? (
                <li>
                  <Tag>+{project.stack.length - 4}</Tag>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
