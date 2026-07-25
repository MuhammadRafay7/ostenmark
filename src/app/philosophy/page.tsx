import { ArrowRight, FileText } from "lucide-react";
import Image from "next/image";

import JsonLd from "@/components/JsonLd";
import Team from "@/components/sections/Team";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/layout";
import { getAboutContent, getSiteSettings, getTeamContent } from "@/lib/content";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { commitments } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About the studio",
  description:
    "A small product engineering studio, deliberately. Senior attention on every project, a process you can hold us to, and code you own outright.",
  path: "/philosophy",
});

/**
 * About page.
 *
 * Server-rendered from the CMS `about_page_content` row. The previous version was
 * a client component with a full-screen loading state, an `unoptimized` portrait
 * image, and a scroll-parallax sidebar.
 *
 * The copy is written in the studio's "we" voice without claiming a headcount we
 * don't have — the honest framing for a small operation selling to larger
 * organisations, and the reason the "how we're set up" section leads on senior
 * attention rather than team size.
 */
export default async function AboutPage() {
  const [about, settings, team] = await Promise.all([
    getAboutContent(),
    getSiteSettings(),
    getTeamContent(),
  ]);

  const capabilities =
    about.capabilities.length > 0 ? about.capabilities : settings.capabilities;

  // Split CMS prose on blank lines so multi-paragraph narratives render as
  // paragraphs rather than one undifferentiated block.
  const paragraphs = about.narrative
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg font-semibold text-fg">
            {about.titleLead}{" "}
            <span className="text-accent">{about.titleEmphasis}</span>
          </h1>
          <p className="mt-6 text-lg text-fg-muted">{about.subheading}</p>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <div>
            {about.portraitUrl ? (
              <div className="relative mb-12 aspect-16/9 overflow-hidden rounded-xl border border-line bg-surface">
                <Image
                  src={about.portraitUrl}
                  alt="The studio at work"
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            ) : null}

            {paragraphs.length > 0 ? (
              <div className="flex max-w-content flex-col gap-6 text-lg text-fg-muted">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="max-w-content text-lg text-fg-muted">
                We&rsquo;re a product engineering studio. We take on a small number
                of projects at a time so that the people who scope your work are the
                same people who build it — no handover to a delivery team you
                haven&rsquo;t met.
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-10 lg:border-l lg:border-line lg:pl-10">
            {capabilities.length > 0 ? (
              <div>
                <h2 className="label text-fg-subtle">Capabilities</h2>
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {capabilities.map((item) => (
                    <li key={item} className="py-2.5 text-sm text-fg">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {about.experienceYears ? (
              <div>
                <h2 className="label text-fg-subtle">Experience</h2>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold text-fg">
                    {about.experienceYears}
                  </span>
                  <span className="text-sm text-fg-muted">years building software</span>
                </p>
              </div>
            ) : null}

            <div>
              <h2 className="label text-fg-subtle">Work with us</h2>
              <ButtonLink href="/inquiry" className="mt-4 w-full">
                Start a project
                <ArrowRight size={15} aria-hidden />
              </ButtonLink>

              {/* The credentials sheet is a printable one-pager. It was
                  unreachable after the redesign — linked from nowhere — so it is
                  surfaced here, where someone evaluating the studio would look. */}
              <a
                href="/cv"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg"
              >
                <FileText size={14} aria-hidden />
                Credentials one-pager
              </a>
            </div>
          </aside>
        </div>
      </Container>

      {/* Renders only when team members exist — see the component. */}
      <Team content={team} />

      {/* Operating commitments, restated here because this is the page a buyer
          reads when they are deciding whether the studio is credible. */}
      <Section surface spacing="md">
        <SectionHeading
          eyebrow="How we're set up"
          title="What you can rely on"
          lede="A small studio has to compete on the things larger vendors treat as negotiable. These are ours, and they're in every contract we sign."
        />

        <dl className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((item) => (
            <div key={item.label}>
              <dt className="label text-fg-subtle">{item.label}</dt>
              <dd className="mt-2 font-display text-2xl font-semibold text-fg">
                {item.value}
              </dd>
              <dd className="mt-1.5 text-sm text-fg-muted">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/philosophy" },
        ])}
      />
    </>
  );
}
