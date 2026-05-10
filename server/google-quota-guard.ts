/**
 * Google Business API Quota Guard
 *
 * Tracks 429 quota-exceeded events in memory and enforces a cooldown window
 * before allowing further calls. This prevents retry storms from hammering
 * Google's per-minute quota limit.
 *
 * Cooldown: 2 minutes after any 429 (Google resets quota per minute, so 2 min
 * gives comfortable headroom for multi-account / multi-location flows).
 */

const QUOTA_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

/** timestamp (ms) of the last 429, keyed by an arbitrary scope string */
const lastHitAt = new Map<string, number>();

const GLOBAL_KEY = "global";

/**
 * Record that a 429 was received. Call this whenever Google returns quota-exceeded.
 * @param key  Optional scope (e.g. a storeId). Defaults to "global" so any caller
 *             that records a hit blocks all callers until cooldown expires.
 */
export function recordQuota429(key: string = GLOBAL_KEY): void {
  const now = Date.now();
  lastHitAt.set(GLOBAL_KEY, now); // always update global
  if (key !== GLOBAL_KEY) lastHitAt.set(key, now);
  console.warn(
    `[QuotaGuard] 429 recorded — key="${key}"  cooldown until ${new Date(now + QUOTA_COOLDOWN_MS).toISOString()}`,
  );
}

/**
 * Check whether the quota is currently cooling down.
 * @param key  Optional scope key (checked AND the global key).
 * @returns    { coolingDown: true, retryAfterMs: number } or { coolingDown: false, retryAfterMs: 0 }
 */
export function isQuotaCoolingDown(key: string = GLOBAL_KEY): {
  coolingDown: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();

  const keys = key === GLOBAL_KEY ? [GLOBAL_KEY] : [key, GLOBAL_KEY];
  let maxRetryAfterMs = 0;

  for (const k of keys) {
    const hit = lastHitAt.get(k);
    if (!hit) continue;
    const elapsed = now - hit;
    if (elapsed >= QUOTA_COOLDOWN_MS) {
      lastHitAt.delete(k);
      continue;
    }
    maxRetryAfterMs = Math.max(maxRetryAfterMs, QUOTA_COOLDOWN_MS - elapsed);
  }

  return maxRetryAfterMs > 0
    ? { coolingDown: true, retryAfterMs: maxRetryAfterMs }
    : { coolingDown: false, retryAfterMs: 0 };
}

/**
 * Seconds remaining in the current cooldown, rounded up. 0 if not cooling down.
 */
export function quotaCooldownSecondsRemaining(key: string = GLOBAL_KEY): number {
  const { retryAfterMs } = isQuotaCoolingDown(key);
  return Math.ceil(retryAfterMs / 1000);
}
