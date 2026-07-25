import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/content";

/**
 * Favicon, generated from whatever the CMS holds.
 *
 * A file convention rather than a `metadata.icons` entry, because Next resolves
 * `app/icon.tsx` ahead of metadata and emits the correct `<link rel="icon">` with
 * a content hash — so a favicon change in the admin actually invalidates the
 * browser's cached copy instead of being pinned to a stale `/favicon.ico`.
 *
 * Resolution order, most to least specific:
 *   1. A dedicated favicon uploaded at /admin/brand.
 *   2. The studio logo.
 *   3. The studio initial on the brand accent colour.
 *
 * Every remote path is wrapped so a fetch failure degrades to the initial rather
 * than failing the build — a site must never be unable to render because its
 * favicon is unreachable.
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Satori cannot fetch remote images itself, so the bytes are inlined as a data
 * URI. SVG is passed through as-is: it needs no raster decoding and re-encoding
 * a vector would only lose fidelity.
 */
async function toDataUri(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return null;

    const type = response.headers.get("content-type") ?? "image/png";
    // Satori has no SVG rasteriser; an SVG favicon would render as nothing.
    if (type.includes("svg")) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    // Guard against an oversized original blowing out the response.
    if (buffer.byteLength > 2_000_000) return null;

    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Icon() {
  const { brand } = await getSiteSettings();

  const source = brand.faviconUrl ?? brand.logoUrl;
  const embedded = source ? await toDataUri(source) : null;

  return new ImageResponse(
    embedded ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
        }}
      >
        <img
          src={embedded}
          alt=""
          width={64}
          height={64}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.accentColor,
          color: "#ffffff",
          fontSize: 40,
          fontWeight: 700,
          // Optical centring: cap-height sits high in the em box, so the glyph
          // reads low without a nudge upward.
          lineHeight: 1,
          paddingBottom: 4,
        }}
      >
        {brand.logoInitial}
      </div>
    ),
    size,
  );
}
