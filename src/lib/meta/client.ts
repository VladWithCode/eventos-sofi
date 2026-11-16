// Browser-only helpers for the Meta Pixel. Safe to import from Client
// Components; every function is a silent no-op on the server or without a pixel.

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

const ATTRIBUTION_KEY = "evs:attribution";

export type ContactMethod = "whatsapp" | "phone" | "instagram" | "facebook";

export function newEventId(): string {
  const c = globalThis.crypto;
  // randomUUID only exists in secure contexts; plain-http previews fall back.
  if (typeof c?.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq(...args);
  } catch {
    // A broken or blocked pixel must never break the page.
  }
}

export function trackPixel(event: string, params?: Record<string, unknown>, eventId?: string): void {
  fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

export function trackCustom(event: string, params?: Record<string, unknown>): void {
  fbq("trackCustom", event, params ?? {});
}

/**
 * Fires Pixel `Contact` and mirrors it to the Conversions API with the same
 * event id. Fire-and-forget: it never blocks or delays the link navigation.
 */
export function trackContactClick(method: ContactMethod): void {
  if (typeof window === "undefined") return;
  const eventId = newEventId();
  trackPixel("Contact", { method }, eventId);
  try {
    const body = JSON.stringify({ eventId, method, sourceUrl: window.location.href });
    // A string body is sent as text/plain, which needs no CORS preflight.
    if (!navigator.sendBeacon?.("/api/meta/contact", body)) {
      void fetch("/api/meta/contact", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Tracking is best effort.
  }
}

type AttributionData = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  placement: string;
  fbclid: string;
  landingUrl: string;
  referrer: string;
};

function captureAttribution(): AttributionData {
  const params = new URLSearchParams(window.location.search);
  const get = (key: string) => params.get(key) ?? "";
  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
    placement: get("placement"),
    fbclid: get("fbclid"),
    landingUrl: window.location.href,
    referrer: document.referrer,
  };
}

/**
 * First-touch attribution as a JSON string for a hidden form input. Captured
 * from the first page of the visit and kept in sessionStorage.
 */
export function getAttribution(): string {
  if (typeof window === "undefined") return "{}";
  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return stored;
  } catch {
    // Storage can be blocked (private mode, disabled cookies).
  }
  const value = JSON.stringify(captureAttribution());
  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, value);
  } catch {
    // Keep working without persistence.
  }
  return value;
}
