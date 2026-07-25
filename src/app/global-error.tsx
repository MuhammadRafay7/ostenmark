"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself.
 *
 * This replaces the entire document, so it has to supply its own `<html>` and
 * `<body>` and cannot rely on the site's stylesheet having loaded — hence the
 * inline styles. Kept minimal on purpose: anything with a dependency could fail
 * for the same reason the layout did.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#ffffff",
          color: "#0d1017",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Something went badly wrong.
          </h1>
          <p style={{ marginTop: "1rem", lineHeight: 1.6, color: "#4d5566" }}>
            The site failed to load. Please reload the page — if it keeps happening,
            email us and we&rsquo;ll look into it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              padding: "0.7rem 1.4rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#ffffff",
              background: "#1f47e0",
              border: 0,
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
