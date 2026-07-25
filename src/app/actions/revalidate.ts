"use server";

import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/content";

/**
 * Clears the cached content for one area of the site.
 *
 * Without this, the caching added in `src/lib/content.ts` would make the CMS feel
 * broken: the admin writes to Supabase directly from the browser, so nothing on
 * the server knows a change happened, and an edit would take up to the hourly
 * revalidation window to appear. Admin pages call this after a successful save so
 * publishing is immediate.
 *
 * **On authorisation:** this is deliberately ungated. A server action is a public
 * endpoint, and gating it would mean threading the admin's Supabase session
 * through to the server — worth doing for anything that reads or writes data, but
 * this does neither. The only possible effect of an unauthenticated call is that
 * the next request re-reads public content from Supabase a little sooner than it
 * would have. `scope` is constrained to a known key, so a caller cannot name an
 * arbitrary tag.
 */
export async function revalidateContent(
  scope: keyof typeof CACHE_TAGS,
): Promise<void> {
  const tag = CACHE_TAGS[scope];
  if (!tag) return;
  // `updateTag` rather than `revalidateTag`: it is the Server Action primitive
  // that gives read-your-own-writes semantics, so the editor sees the change on
  // the very next request rather than on the one after.
  updateTag(tag);
}
