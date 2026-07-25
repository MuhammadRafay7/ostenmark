import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/content";

/**
 * Apple touch icon — the tile used when the site is saved to an iOS home screen.
 *
 * Separate from `icon.tsx` for two reasons: iOS requires 180×180, and it does not
 * apply a background to transparent icons, so a transparent logo would render as
 * a black square. The accent-coloured plate below prevents that, and gives the
 * padding a home-screen tile needs.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function toDataUri(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/png";
    if (type.includes("svg")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 2_000_000) return null;
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function AppleIcon() {
  const { brand } = await getSiteSettings();

  const source = brand.faviconUrl ?? brand.logoUrl;
  const embedded = source ? await toDataUri(source) : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: embedded ? "#ffffff" : brand.accentColor,
        padding: embedded ? 24 : 0,
        color: "#ffffff",
        fontSize: 104,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {embedded ? (
        <img
          src={embedded}
          alt=""
          width={132}
          height={132}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        brand.logoInitial
      )}
    </div>,
    size,
  );
}
