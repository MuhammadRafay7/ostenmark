import type { NextConfig } from "next";

/**
 * The Supabase storage host is derived from the project URL rather than
 * hardcoded, which the previous config did — so the allowlist would silently stop
 * matching if the project were ever migrated, and every remote image would fail
 * to optimise with no obvious cause.
 */
function supabaseImageHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    return [
      {
        protocol: "https" as const,
        hostname: new URL(url).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageHost(),
    // Matches the layout breakpoints actually in use, so the optimiser isn't
    // generating variants nothing requests.
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [32, 64, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    // CMS uploads are effectively immutable — filenames are timestamped on
    // upload — so they can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Surfaces double-invoked effects and legacy API usage during development.
  reactStrictMode: true,

  // Don't advertise the framework version to anyone probing the site.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops a response being MIME-sniffed into an executable type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Blocks clickjacking via iframe embedding.
          { key: "X-Frame-Options", value: "DENY" },
          // Sends the origin but not the path to third parties.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing on this site needs these device APIs.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Forces HTTPS for two years, including subdomains.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
