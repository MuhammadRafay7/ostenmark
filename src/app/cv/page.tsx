import { ArrowLeft, Globe, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import PrintButton from "@/components/PrintButton";
import { getAboutContent, getProjects, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Credentials",
  description: "Studio credentials and selected work, formatted for print.",
  path: "/cv",
  // Thin and largely duplicative of the about page; excluded from robots.ts too.
  noIndex: true,
});

/**
 * Printable credentials sheet.
 *
 * Server-rendered from the same CMS content as the rest of the site, so it can't
 * drift out of date. The sheet itself stays a fixed light document regardless of
 * the visitor's theme — it is a paper artefact, and the print rules in globals.css
 * pin it to light so a dark-mode visitor doesn't print a black page.
 */
export default async function CvPage() {
  const [settings, about, projects] = await Promise.all([
    getSiteSettings(),
    getAboutContent(),
    getProjects(),
  ]);

  const { brand, contact, socials } = settings;

  // Featured first, then by the admin's ordering. Six keeps it to one sheet.
  const selected = [...projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 6);

  const capabilities =
    about.capabilities.length > 0 ? about.capabilities : settings.capabilities;

  const summary = about.narrative || settings.footerNarrative;

  return (
    <div className="min-h-screen bg-surface px-4 py-10 print:bg-white print:p-0 sm:px-6">
      {/* Toolbar — excluded from the printed output. */}
      <div className="no-print mx-auto mb-6 flex max-w-[820px] items-center justify-between gap-4">
        <Link
          href="/philosophy"
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={15} aria-hidden />
          Back to about
        </Link>
        <PrintButton />
      </div>

      <article className="cv-sheet mx-auto max-w-[820px] overflow-hidden rounded-md bg-white text-gray-900 shadow-lg print:shadow-none">
        <header
          className="px-8 pt-10 pb-7 sm:px-12"
          style={{ borderTop: `5px solid ${brand.accentColor}` }}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                {brand.name}
              </h1>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                {about.subheading}
              </p>
            </div>

            {brand.logoUrl ? (
              <span className="relative block h-14 w-14 shrink-0">
                <Image
                  src={brand.logoUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </span>
            ) : (
              <span
                aria-hidden
                className="grid h-14 w-14 shrink-0 place-items-center rounded-lg font-display text-xl font-semibold text-white"
                style={{ backgroundColor: brand.accentColor }}
              >
                {brand.logoInitial}
              </span>
            )}
          </div>

          {/* print-url makes link targets visible on paper. */}
          <div className="print-url mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1.5 hover:text-gray-950"
            >
              <Mail size={13} aria-hidden style={{ color: brand.accentColor }} />
              {contact.email}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} aria-hidden style={{ color: brand.accentColor }} />
              {contact.location}
            </span>
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gray-950"
              >
                {social.label}
              </a>
            ))}
          </div>
        </header>

        <div className="grid gap-9 px-8 pb-12 sm:px-12 md:grid-cols-3">
          <div className="flex flex-col gap-9 md:col-span-2">
            {summary ? (
              <section>
                <SheetHeading accent={brand.accentColor}>Profile</SheetHeading>
                <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
              </section>
            ) : null}

            {selected.length > 0 ? (
              <section>
                <SheetHeading accent={brand.accentColor}>Selected work</SheetHeading>
                <div className="flex flex-col gap-5">
                  {selected.map((project) => (
                    <div key={project.id} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-display text-base font-semibold text-gray-950">
                          {project.title}
                        </h3>
                        <span
                          className="shrink-0 text-2xs font-medium uppercase tracking-wider"
                          style={{ color: brand.accentColor }}
                        >
                          {project.category}
                        </span>
                      </div>

                      {project.description ? (
                        <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                          {project.description}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {project.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-2xs text-gray-600"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-2xs font-medium"
                            style={{ color: brand.accentColor }}
                          >
                            <Globe size={11} aria-hidden />
                            Live
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="flex flex-col gap-9">
            {about.experienceYears ? (
              <section>
                <SheetHeading accent={brand.accentColor}>Experience</SheetHeading>
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold leading-none text-gray-950">
                    {about.experienceYears}
                  </span>
                  <span className="text-xs leading-tight text-gray-600">
                    years building
                    <br />
                    software
                  </span>
                </p>
                <p className="mt-3 text-xs text-gray-600">
                  <span aria-hidden style={{ color: brand.accentColor }}>
                    ●
                  </span>{" "}
                  {contact.availability}
                </p>
              </section>
            ) : null}

            {capabilities.length > 0 ? (
              <section>
                <SheetHeading accent={brand.accentColor}>Capabilities</SheetHeading>
                <ul className="flex flex-col gap-1.5">
                  {capabilities.map((capability) => (
                    <li key={capability} className="text-[13px] text-gray-700">
                      {capability}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>

        <div className="flex justify-between bg-gray-950 px-8 py-3.5 text-2xs text-gray-300 sm:px-12">
          <span>{brand.name} — credentials</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </article>
    </div>
  );
}

function SheetHeading({
  children,
  accent,
}: {
  children: ReactNode;
  accent: string;
}) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <span
        aria-hidden
        className="h-0.5 w-5 shrink-0"
        style={{ backgroundColor: accent }}
      />
      <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-gray-950">
        {children}
      </h2>
    </div>
  );
}
