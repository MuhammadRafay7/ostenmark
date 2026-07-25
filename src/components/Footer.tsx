import { Github, Instagram, Linkedin, Mail, Twitter, type LucideIcon } from "lucide-react";
import Link from "next/link";

import LocalTime from "@/components/LocalTime";
import { Container } from "@/components/ui/layout";
import { navigation } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

/**
 * Site footer.
 *
 * Now a server component reading the settings passed down from the root layout.
 * The previous version was a client component that re-queried Supabase from the
 * browser in a `useEffect` even though the layout had already fetched the same
 * row on the server — a redundant round-trip on every page, and a burst of
 * layout shift as the real values replaced the defaults.
 */

const socialIcons: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
};

export default function Footer({ settings }: { settings: SiteSettings }) {
  const { brand, contact, socials, footerNarrative, copyright } = settings;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-16 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-20">
          {/* Closing call to action */}
          <div className="max-w-md">
            <h2 className="font-display text-display-sm text-fg">
              Let&rsquo;s talk about your project.
            </h2>
            <p className="mt-4 text-base text-fg-muted">{footerNarrative}</p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/inquiry"
                className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-fg-on-accent transition-colors hover:bg-accent-hover"
              >
                Start a project
              </Link>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm font-medium text-fg underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {contact.email}
              </a>
            </div>
          </div>

          {/* Directory */}
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <nav aria-labelledby="footer-nav-heading">
              <h2 id="footer-nav-heading" className="label text-fg-subtle">
                Site
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/inquiry"
                    className="text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cv"
                    className="text-sm text-fg-muted transition-colors hover:text-fg"
                  >
                    Credentials
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className="label text-fg-subtle">Studio</h2>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fg-muted">
                <li>{contact.location}</li>
                <li>
                  <LocalTime timezone={contact.timezone} />
                </li>
                {contact.phone ? (
                  <li>
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="transition-colors hover:text-fg"
                    >
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-positive"
                  />
                  {contact.availability}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal line */}
        <div className="mt-14 flex flex-col-reverse items-start gap-6 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-subtle">
            © {year} {copyright}. All rights reserved.
          </p>

          {socials.length > 0 ? (
            <ul className="flex items-center gap-1">
              {socials.map((social) => {
                const Icon = socialIcons[social.id] ?? Mail;
                return (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-sunken hover:text-fg"
                    >
                      <Icon size={16} aria-hidden />
                      {/* The icon alone is not an accessible name. */}
                      <span className="sr-only">
                        {brand.name} on {social.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
