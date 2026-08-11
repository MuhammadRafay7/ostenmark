import {
  ArrowUpRight,
  Clock,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Timer,
  Twitter,
  type LucideIcon,
} from "lucide-react";
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
              <ul className="mt-4 flex flex-col gap-1">
                {[
                  ...navigation,
                  { href: "/inquiry", label: "Contact" },
                  { href: "/cv", label: "Credentials" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-1 py-0.5 text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.label}
                      </span>
                      <ArrowUpRight
                        size={13}
                        aria-hidden
                        className="-translate-x-1 text-fg-subtle opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="label text-fg-subtle">Studio</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-muted">
                <li className="flex items-center gap-2.5">
                  <MapPin size={14} aria-hidden className="shrink-0 text-fg-subtle" />
                  <span>{contact.location}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock size={14} aria-hidden className="shrink-0 text-fg-subtle" />
                  <LocalTime timezone={contact.timezone} />
                </li>
                {contact.phone ? (
                  <li className="flex items-center gap-2.5">
                    <Phone size={14} aria-hidden className="shrink-0 text-fg-subtle" />
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="transition-colors hover:text-fg"
                    >
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-center gap-2.5">
                  {/* Live status: a solid dot with a slow ping ring behind it. */}
                  <span aria-hidden className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
                  </span>
                  <span className="font-medium text-fg">{contact.availability}</span>
                </li>
                {contact.responseTime ? (
                  <li className="flex items-center gap-2.5 text-fg-subtle">
                    <Timer size={14} aria-hidden className="shrink-0" />
                    <span>{contact.responseTime}</span>
                  </li>
                ) : null}
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
