import JsonLd from "@/components/JsonLd";
import ProjectCard from "@/components/ProjectCard";
import WorkFilter from "@/components/WorkFilter";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getProjectCategories, getProjects } from "@/lib/content";
import { breadcrumbSchema, pageMetadata, workCollectionSchema } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Selected work",
  description:
    "Case studies from the Starvix studio — web platforms, mobile applications and systems integration work, with the stack each one runs on.",
  path: "/projects",
});

/**
 * Work index.
 *
 * Server-rendered. The previous version was a client component that fetched every
 * project in a `useEffect`, so search engines and social crawlers received a page
 * with no work on it at all — the single most damaging place on the site for that
 * to happen.
 *
 * Filtering is driven by the `?category=` search param (see WorkFilter), which
 * keeps filtered views linkable and the page cacheable.
 */
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, projects, categories] = await Promise.all([
    searchParams,
    getProjects(),
    getProjectCategories(),
  ]);

  const active = category && categories.includes(category) ? category : "all";
  const visible =
    active === "all"
      ? projects
      : projects.filter((project) => project.category === active);

  const counts: Record<string, number> = { all: projects.length };
  for (const project of projects) {
    counts[project.category] = (counts[project.category] ?? 0) + 1;
  }

  return (
    <>
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <Eyebrow>Selected work</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg font-semibold text-fg">
            Things we&rsquo;ve built.
          </h1>
          <p className="mt-6 text-lg text-fg-muted">
            A representative sample rather than an exhaustive list — some of what we
            do sits behind an NDA. If you want to see work closer to your own
            problem, ask and we&rsquo;ll share what we can.
          </p>
        </div>

        {categories.length > 1 ? (
          <div className="mt-12">
            <WorkFilter categories={categories} active={active} counts={counts} />
          </div>
        ) : null}

        {visible.length > 0 ? (
          <RevealGroup className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {visible.map((project, index) => (
              <RevealItem key={project.id}>
                <ProjectCard project={project} priority={index < 2} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="mt-12 rounded-xl border border-line bg-surface p-12 text-center">
            <h2 className="font-display text-xl font-semibold text-fg">
              {projects.length === 0
                ? "Case studies are on their way."
                : "Nothing in this category yet."}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-fg-muted">
              {projects.length === 0
                ? "We're writing these up properly rather than posting screenshots. In the meantime, get in touch and we'll walk you through relevant work directly."
                : "Try another category, or ask us about work in this area — not everything we've shipped is published."}
            </p>
            <ButtonLink href="/inquiry" variant="secondary" className="mt-7">
              Get in touch
            </ButtonLink>
          </div>
        )}
      </Container>

      <JsonLd
        data={[
          workCollectionSchema(projects),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Work", path: "/projects" },
          ]),
        ]}
      />
    </>
  );
}
