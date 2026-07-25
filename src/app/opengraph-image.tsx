import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/content";
import { siteTagline } from "@/lib/site";

/**
 * Default social-share card for the site.
 *
 * Deliberately typographic and self-contained: no remote fonts and no remote
 * images, so generation can never fail at build time or in a cold edge region
 * and leave a link previewing as a blank rectangle.
 */

export const alt = "Starvix — product engineering studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { brand, contact } = await getSiteSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Satori has no blur filter, so a large translucent shape renders as a
          // hard-edged blob rather than a glow. A gradient wash plus a solid
          // accent edge gives the brand colour a presence that stays crisp.
          background: `linear-gradient(135deg, #12161f 0%, #0d1017 55%)`,
          padding: "80px",
          paddingLeft: "74px",
          position: "relative",
        }}
      >
        {/* Brand accent edge, from the colour set in the CMS. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: brand.accentColor,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: brand.accentColor,
            }}
          />
          <div
            style={{
              color: "#f8f9fb",
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            {brand.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Software teams for companies that need it shipped properly.
          </div>
          {/* Satori requires an explicit display on any element with more than
              one child, so interpolated lines are built as a single string. */}
          <div style={{ color: "#9aa2b4", fontSize: 30, letterSpacing: "-0.01em" }}>
            {`${siteTagline} · ${contact.location}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(248,249,251,0.14)",
            paddingTop: 32,
            color: "#6b7488",
            fontSize: 24,
          }}
        >
          <span>{contact.email}</span>
          <span style={{ color: brand.accentColor }}>{contact.responseTime}</span>
        </div>
      </div>
    ),
    size,
  );
}
