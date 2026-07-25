import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

import InquiryForm from "@/components/InquiryForm";
import JsonLd from "@/components/JsonLd";
import LocalTime from "@/components/LocalTime";
import { Container, Eyebrow } from "@/components/ui/layout";
import { getSiteSettings } from "@/lib/content";
import { breadcrumbSchema, contactPageSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Start a project",
  description:
    "Tell us what you're building and we'll reply within one business day with an honest view on scope, cost and timeline.",
  path: "/inquiry",
});

/**
 * Contact page.
 *
 * Server-rendered, where the previous version was a client component that showed
 * a full-screen "Loading…" state while it fetched the studio's own email address
 * from the browser — so the page had no content for a crawler, and none for the
 * first moment a visitor saw it either.
 */
export default async function InquiryPage() {
  const { contact } = await getSiteSettings();

  return (
    <>
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <Eyebrow>Start a project</Eyebrow>
          <h1 className="mt-6 font-display text-display-lg font-semibold text-fg">
            Tell us what you&rsquo;re building.
          </h1>
          <p className="mt-6 text-lg text-fg-muted">
            The more you can share about the problem, the constraints and your
            timeline, the more useful our first reply will be. If we&rsquo;re not
            the right studio for it, we&rsquo;ll say so.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="rounded-xl border border-line bg-surface-raised p-6 shadow-sm sm:p-9">
            <InquiryForm contactEmail={contact.email} />
          </div>

          {/* Direct alternatives — a web form is not everyone's preferred
              channel, particularly in enterprise procurement. */}
          <aside className="flex flex-col gap-8 lg:pt-2">
            <div>
              <h2 className="label text-fg-subtle">Or reach us directly</h2>
              <ul className="mt-4 flex flex-col gap-4">
                <ContactRow icon={<Mail size={16} aria-hidden />} label="Email">
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    {contact.email}
                  </a>
                </ContactRow>

                {contact.phone ? (
                  <ContactRow icon={<Phone size={16} aria-hidden />} label="Phone">
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="font-medium text-fg transition-colors hover:text-accent"
                    >
                      {contact.phone}
                    </a>
                  </ContactRow>
                ) : null}

                <ContactRow icon={<MapPin size={16} aria-hidden />} label="Based in">
                  <span className="text-fg">{contact.location}</span>
                </ContactRow>

                <ContactRow icon={<Clock size={16} aria-hidden />} label="Local time">
                  <LocalTime timezone={contact.timezone} className="text-fg" />
                </ContactRow>
              </ul>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-fg">What happens next</h2>
              <ol className="mt-3 flex flex-col gap-3 text-sm text-fg-muted">
                <Step n={1}>
                  We read it properly and reply within one business day.
                </Step>
                <Step n={2}>
                  A 30-minute call to test whether the fit is real, both ways.
                </Step>
                <Step n={3}>
                  A written outline of scope, approach and cost — no obligation.
                </Step>
              </ol>
            </div>
          </aside>
        </div>
      </Container>

      <JsonLd
        data={[
          contactPageSchema(contact),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Start a project", path: "/inquiry" },
          ]),
        ]}
      />
    </>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-fg-subtle">{icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className="text-xs text-fg-subtle">{label}</span>
        <span className="text-sm">{children}</span>
      </span>
    </li>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-subtle font-mono text-2xs font-medium text-accent"
      >
        {n}
      </span>
      {children}
    </li>
  );
}
