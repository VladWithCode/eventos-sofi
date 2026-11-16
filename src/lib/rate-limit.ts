import "server-only";

// In-memory and per process: enough for a single self-hosted server.
const globalForLimits = globalThis as typeof globalThis & { __eventosSofiHits?: Map<string, number[]> };
const hits = (globalForLimits.__eventosSofiHits ??= new Map<string, number[]>());

/**
 * Records one hit for `key` and returns false when the key already reached
 * `limit` hits within the last `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) prune(now, windowMs);
  return true;
}

function prune(now: number, windowMs: number) {
  for (const [key, times] of hits) {
    if (times.every((t) => now - t >= windowMs)) hits.delete(key);
  }
}
