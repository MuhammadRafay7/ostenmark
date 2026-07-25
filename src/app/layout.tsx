import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import BrandAccent from "@/components/BrandAccent";
import JsonLd from "@/components/JsonLd";
import ThemeScript from "@/components/ThemeScript";
import SiteChrome from "@/components/SiteChrome";
import { getSiteSettings } from "@/lib/content";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { siteDescription, siteName, siteTagline, siteUrl } from "@/lib/site";

import "@/app/globals.css";

/**
 * Font loading.
 *
 * Each family is exposed as a `--font-*-src` variable which globals.css aliases
 * into Tailwind's `--font-sans` / `--font-display` / `--font-serif` / `--font-mono`
 * tokens. The indirection matters: the previous setup pointed `--font-inter` at
 * itself (`--font-inter: "Inter", var(--font-inter)`), producing a circular
 * reference that invalidated the whole `body` font-family declaration, so no body
 * copy on the site was ever actually rendering in its intended typeface.
 *
 * Only the weights actually used are requested, and `display: "swap"` keeps text
 * visible during load — both matter on the slow international connections this
 * site needs to serve.
 */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
  weight: ["400", "500", "600"],
});

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display-src",
  display: "swap",
  weight: ["500", "600", "700"],
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-src",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-src",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${siteTagline}`,
    // Every child page gets the studio name appended without repeating itself.
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "product engineering studio",
    "software development agency",
    "Next.js development",
    "React development",
    "mobile app development",
    "custom software development",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} — ${siteTagline}`,
    description: siteDescription,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — ${siteTagline}`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never block zoom — it is an accessibility failure and a WCAG violation.
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1017" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      // ThemeScript mutates this element before React hydrates.
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        <ThemeScript />
        <BrandAccent color={settings.brand.accentColor} />
      </head>
      <body className="bg-canvas text-fg font-sans">
        {/* First focusable element on the page — lets keyboard and screen-reader
            users bypass the navigation entirely. */}
        <a
          href="#main"
          className="sr-only-focusable focus:z-200 focus:left-4 focus:top-4 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-fg-on-accent"
        >
          Skip to content
        </a>

        <SiteChrome settings={settings}>{children}</SiteChrome>

        <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />
        <Analytics />
      </body>
    </html>
  );
}
