import { ArrowLeft, ArrowRight, Download, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/JsonLd";
import ProjectGallery from "@/components/ProjectGallery";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Tag } from "@/components/ui/layout";
import { getProject, getProjects } from "@/lib/content";
import { breadcrumbSchema, pageMetadata, projectSchema } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

/**
 * Case study.
 *
 * Server-rendered with real metadata, where the previous version was a client
 * component that fetched by id in a `useEffect` and displayed
 * `[ACCESSING_ARCHIVE...]` in the meantime — so every case study was invisible to
 * search engines and previewed as an empty page when shared.
 *
 * It also returned its own inline "ENTRY_NOT_FOUND" panel for a missing project
 * while still serving HTTP 200. Now a genuinely missing id calls `notFound()`,
 * which returns a 404 so search engines don't index dead case studies.
 */

/** Pre-render every case study at build time; new ones fill in on first request. */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return { title: "Case study not found", robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: `${project.title} — ${project.category} case study`,
    description:
      project.description.slice(0, 200) ||
      `A ${project.category.toLowerCase()} project built by Starvix.`,
    path: `/projects/${project.id}`,
    // Points at this route's own generated card (opengraph-image.tsx alongside
    // this file) so a forwarded case-study link previews with its own title.
    image: `${siteUrl}/projects/${project.id}/opengraph-image`,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, projects] = await Promise.all([getProject(id), getProjects()]);

  if (!project) notFound();

  // "Next project" beats a bare back-link: it keeps a browsing prospect moving
  // through the work instead of dead-ending them.
  const index = projects.findIndex((entry) => entry.id === project.id);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <Container className="py-10 sm:py-12">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={15} aria-hidden />
          All work
        </Link>
      </Container>

      <Container className="pb-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <div className="max-w-2xl">
            <p className="label text-accent">{project.category}</p>
            <h1 className="mt-4 font-display text-display-lg font-semibold text-fg">
              {project.title}
            </h1>
            {project.description ? (
              // `whitespace-pre-line` preserves paragraph breaks the CMS stores
              // as newlines in a plain textarea.
              <p className="mt-7 whitespace-pre-line text-lg text-fg-muted">
                {project.description}
              </p>
            ) : null}
          </div>

          {/* Project facts panel */}
          <aside className="lg:pt-2">
            <div className="rounded-xl border border-line bg-surface p-6">
              {project.stack.length > 0 ? (
                <>
                  <h2 className="label text-fg-subtle">Built with</h2>
                  <ul className="mt-3.5 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <li key={tech}>
                        <Tag className="bg-canvas">{tech}</Tag>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {project.liveUrl || project.apkUrl ? (
                <div
                  className={
                    project.stack.length > 0
                      ? "mt-6 flex flex-col gap-2.5 border-t border-line pt-6"
                      : "flex flex-col gap-2.5"
                  }
                >
                  {project.liveUrl ? (
                    <ButtonLink href={project.liveUrl} variant="secondary" size="sm">
                      {project.category === "Mobile" ? "View on store" : "Visit live site"}
                      <ExternalLink size={14} aria-hidden />
                    </ButtonLink>
                  ) : null}

                  {project.apkUrl ? (
                    <a
                      href={project.apkUrl}
                      download
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface-raised px-3.5 text-sm font-medium text-fg transition-colors hover:border-fg-subtle"
                    >
                      Download Android build
                      <Download size={14} aria-hidden />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </Container>

      {/* Cover image */}
      {project.coverImage ? (
        <Container className="pb-16">
          <div className="relative aspect-16/9 overflow-hidden rounded-xl border border-line bg-surface">
            <Image
              src={project.coverImage}
              alt={`${project.title} — main interface`}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              // This is the page's LCP element.
              priority
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      {project.gallery.length > 0 ? (
        <Container className="pb-20">
          <h2 className="label mb-6 text-fg-subtle">Screens</h2>
          <ProjectGallery images={project.gallery} projectTitle={project.title} />
        </Container>
      ) : null}

      {/* Next project + CTA */}
      <section className="border-t border-line bg-surface">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
            {next && next.id !== project.id ? (
              <div>
                <p className="label text-fg-subtle">Next project</p>
                <Link
                  href={`/projects/${next.id}`}
                  className="group mt-3 inline-flex items-baseline gap-2 font-display text-display-sm font-semibold text-fg"
                >
                  <span className="transition-colors group-hover:text-accent">
                    {next.title}
                  </span>
                  <ArrowRight
                    size={22}
                    aria-hidden
                    className="shrink-0 text-fg-subtle transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            ) : (
              <div>
                <p className="label text-fg-subtle">Your project</p>
                <p className="mt-3 font-display text-display-sm font-semibold text-fg">
                  Something similar in mind?
                </p>
              </div>
            )}

            <ButtonLink href="/inquiry" size="lg" className="shrink-0">
              Start a project
              <ArrowRight size={16} aria-hidden />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <JsonLd
        data={[
          projectSchema(project),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Work", path: "/projects" },
            { name: project.title, path: `/projects/${project.id}` },
          ]),
        ]}
      />
    </>
  );
}
