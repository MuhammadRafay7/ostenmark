import { ImageResponse } from "next/og";

import { getProject, getSiteSettings } from "@/lib/content";

/**
 * Per-case-study share card, so a prospect forwarding a specific project
 * internally gets that project's title in the preview rather than a generic one.
 */

export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, { brand }] = await Promise.all([getProject(id), getSiteSettings()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // See the note in app/opengraph-image.tsx: Satori cannot blur, so the
          // accent is expressed as a solid edge rather than a soft shape.
          background: `linear-gradient(135deg, #12161f 0%, #0d1017 55%)`,
          padding: "80px",
          paddingLeft: "74px",
          position: "relative",
        }}
      >
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#9aa2b4",
              fontSize: 26,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {`${brand.name} · Case study`}
          </div>
          <div
            style={{
              color: brand.accentColor,
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {project?.category ?? "Product"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 84,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              maxWidth: 940,
            }}
          >
            {project?.title ?? "Selected work"}
          </div>
          {project?.description ? (
            <div
              style={{
                color: "#9aa2b4",
                fontSize: 30,
                lineHeight: 1.4,
                maxWidth: 880,
                // Keep the card to a single readable block regardless of copy length.
                display: "block",
                overflow: "hidden",
              }}
            >
              {project.description.length > 150
                ? `${project.description.slice(0, 150).trimEnd()}…`
                : project.description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            borderTop: "1px solid rgba(248,249,251,0.14)",
            paddingTop: 32,
          }}
        >
          {(project?.stack ?? []).slice(0, 5).map((tech) => (
            <span
              key={tech}
              style={{
                color: "#cfd4e0",
                fontSize: 22,
                border: "1px solid rgba(248,249,251,0.18)",
                borderRadius: 8,
                padding: "8px 18px",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
