import { ArrowRight } from "lucide-react";

import JsonLd from "@/components/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/ui/layout";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getAboutContent, getSiteSettings } from "@/lib/content";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Technical expertise",
  description:
    "The stack we build on and why we chose it — TypeScript end to end, PostgreSQL, Next.js, React Native — plus the standards we hold every project to.",
  path: "/tech-stack",
});

/**
 * Expertise page.
 *
 * The previous version listed technology names with generic marketing blurbs.
 * A technical evaluator on the client side is not reading to learn what
 * TypeScript is; they are checking whether the choices are deliberate and whether
 * the studio can defend them. So each entry states the *reason* for the choice,
 * and the page closes on engineering standards, which is the part that actually
 * differentiates one vendor from another.
 *
 * Capabilities from the CMS are rendered as an additional list rather than the
 * primary content, since that field is a free-text list with no rationale attached.
 */

const stack = [
  {
    area: "Language",
    choice: "TypeScript, end to end",
    reason:
      "One language across the browser, the server and the build scripts, with types shared rather than duplicated. Most integration bugs become compile errors instead of production incidents.",
  },
  {
    area: "Web framework",
    choice: "Next.js (App Router)",
    reason:
      "Server rendering by default, so pages are fast on a mid-range phone and legible to search engines. Caching is explicit and per-route rather than something you hope a CDN gets right.",
  },
  {
    area: "Data",
    choice: "PostgreSQL",
    reason:
      "Relational, transactional, and boring in the way infrastructure should be. Constraints live in the database, so a bug in one service can't quietly corrupt everyone else's data.",
  },
  {
    area: "Mobile",
    choice: "React Native with Expo",
    reason:
      "One codebase and one team for iOS and Android, sharing business logic with the web app. Over-the-air updates mean a fix ships in hours, not in a store review cycle.",
  },
  {
    area: "Interface",
    choice: "Tailwind CSS with design tokens",
    reason:
      "A constrained set of colour, spacing and type values rather than ad-hoc styling. Design stays consistent as a codebase grows and as new people join it.",
  },
  {
    area: "Infrastructure",
    choice: "Managed platforms, reproducible deploys",
    reason:
      "Vercel, Supabase and similar managed services in place of servers we'd have to patch. Every deploy comes from a commit, so any release can be identified and rolled back.",
  },
];

const standards = [
  {
    title: "Accessibility is not a phase",
    detail:
      "Keyboard access, focus management, semantic markup and colour contrast are part of building a component, not a remediation project after launch. Relevant in most public-sector and enterprise procurement, and simply correct regardless.",
  },
  {
    title: "Performance budgets",
    detail:
      "Images optimised and sized, JavaScript kept off pages that don't need it, and Core Web Vitals treated as a release gate. Your users are not all on office fibre.",
  },
  {
    title: "You own everything",
    detail:
      "Your repository, your cloud accounts, your domains. We work in your organisation's infrastructure wherever possible, so there is nothing to extract if you stop working with us.",
  },
  {
    title: "Documented handover",
    detail:
      "Architecture notes, environment setup, and a runbook for the things that page someone at 3am. Written for the engineer who joins after we're gone.",
  },
];

export default async function TechStackPage() {
  const [about, settings] = await Promise.all([getAboutContent(), getSiteSettings()]);

  const capabilities = [
    ...new Set([...about.capabilities, ...settings.capabilities]),
  ];

  return (
    <>
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <Eyebrow>Expertise</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg font-semibold text-fg">
            The stack, and why.
          </h1>
          <p className="mt-6 text-lg text-fg-muted">
            We keep a deliberately narrow toolset and go deep on it. Fewer
            technologies means fewer unknowns, faster delivery, and a codebase your
            own team can pick up.
          </p>
        </div>

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-2"
        >
          {stack.map((item) => (
            <RevealItem as="li" key={item.area} className="bg-canvas p-7 sm:p-8">
              <p className="label text-accent">{item.area}</p>
              <h2 className="mt-3 font-display text-lg font-semibold text-fg">
                {item.choice}
              </h2>
              <p className="mt-3 text-base text-fg-muted">{item.reason}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        {capabilities.length > 0 ? (
          <div className="mt-14 rounded-xl border border-line bg-surface p-7 sm:p-8">
            <h2 className="label text-fg-subtle">Also in regular use</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {capabilities.map((capability) => (
                <li
                  key={capability}
                  className="rounded-full border border-line bg-canvas px-3 py-1.5 text-sm text-fg-muted"
                >
                  {capability}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>

      <Section surface spacing="md">
        <SectionHeading
          eyebrow="Engineering standards"
          title="How we build, regardless of the project"
          lede="The parts of the work that don't appear in a feature list, and that cost the most to add afterwards."
        />

        <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {standards.map((standard) => (
            <div key={standard.title}>
              <dt className="font-display text-lg font-semibold text-fg">
                {standard.title}
              </dt>
              <dd className="mt-2.5 text-base text-fg-muted">{standard.detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14">
          <ButtonLink href="/inquiry" size="lg">
            Discuss your technical requirements
            <ArrowRight size={16} aria-hidden />
          </ButtonLink>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Expertise", path: "/tech-stack" },
        ])}
      />
    </>
  );
}
