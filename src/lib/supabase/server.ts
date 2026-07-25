import { createClient } from "@supabase/supabase-js";

/**
 * Read-only Supabase client for server-side rendering of public pages.
 *
 * Deliberately *not* the `@supabase/ssr` cookie-bound client: public content
 * reads carry no user session, and a cookie-bound client would opt every page
 * out of caching. Auth-bound access stays in `src/proxy.ts` (route protection)
 * and `src/lib/supabase.ts` (the browser client the admin CMS uses).
 *
 * Uses the anon key, so row-level security still applies to every query here.
 */
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

/**
 * Resolves a value from an image column to an absolute URL.
 *
 * The admin CMS writes either a bare storage path (`projects/cover-123.jpg`) or
 * an already-absolute URL, depending on which editor saved it. Both shapes exist
 * in production data, so every read path has to handle both.
 */
export function resolveStorageUrl(
  value: string | null | undefined,
  bucket = "uploads",
): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const { data } = supabaseServer.storage.from(bucket).getPublicUrl(value);
  return data.publicUrl ?? null;
}
