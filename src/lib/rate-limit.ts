/**
 * Best-effort in-process rate limiter.
 *
 * **Known limitation, stated plainly:** this is per-instance memory. On a
 * serverless platform each cold instance starts with an empty map, so a
 * determined attacker with many concurrent requests can exceed the limit. It is
 * here to stop casual abuse and accidental double-submits at near-zero cost, and
 * it is layered with a honeypot and a database-side duplicate check rather than
 * relied on alone.
 *
 * If inquiry spam ever becomes a real problem, replace this with a Redis or
 * Upstash-backed counter — the call signature is designed to be a drop-in.
 */

interface Bucket {
  count: number;
  /** Epoch ms at which the bucket resets. */
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Cap the map so a flood of unique keys can't grow it without bound. */
const MAX_KEYS = 5_000;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry. Only meaningful when blocked. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) {
      // Drop everything already expired; if that frees nothing, clear outright.
      for (const [k, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(k);
      }
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfter: 0 };
}

/**
 * Best available client identifier.
 *
 * `x-forwarded-for` is a client-supplied header and therefore spoofable in
 * general; behind Vercel's proxy the left-most entry is rewritten to the real
 * peer address, which is why it is read first. Falls back to a shared bucket, so
 * an unidentifiable caller is limited rather than exempt.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
