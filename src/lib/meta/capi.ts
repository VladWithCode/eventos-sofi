import "server-only";
import { createHash } from "node:crypto";
import type { RequestContext } from "@/lib/request";

const GRAPH_URL = "https://graph.facebook.com/v27.0";
const TIMEOUT_MS = 8000;

export type CapiEvent = {
  name: "Lead" | "Contact";
  eventId: string;
  /** Page where the event happened (attribution landing URL or Referer). */
  sourceUrl: string;
  request: RequestContext;
  user?: { name?: string; phone?: string; email?: string };
  /** From the first-touch attribution; used to build `fbc` when the cookie is missing. */
  fbclid?: string;
  customData?: Record<string, string>;
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

function hashedUserData(event: CapiEvent) {
  const data: Record<string, string> = { country: sha256("mx") };
  const { name, phone, email } = event.user ?? {};

  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail) data.em = sha256(normalizedEmail);

  // Phones arrive already normalized to "52" + 10 digits.
  if (phone) {
    data.ph = sha256(phone);
    data.external_id = sha256(phone);
  }

  const cleanName = name?.trim().toLowerCase().replace(/\s+/g, " ");
  if (cleanName) {
    const space = cleanName.indexOf(" ");
    data.fn = sha256(space === -1 ? cleanName : cleanName.slice(0, space));
    if (space !== -1) data.ln = sha256(cleanName.slice(space + 1));
  }
  return data;
}

function plainUserData(event: CapiEvent) {
  const { ip, userAgent, fbp, fbc } = event.request;
  const data: Record<string, string> = {};
  if (ip && ip !== "unknown") data.client_ip_address = ip;
  if (userAgent) data.client_user_agent = userAgent;
  if (fbp) data.fbp = fbp;
  // fbclid is case sensitive: never normalize it.
  const builtFbc = event.fbclid ? `fb.1.${Date.now()}.${event.fbclid}` : "";
  if (fbc || builtFbc) data.fbc = fbc || builtFbc;
  return data;
}

/**
 * Sends one event to the Meta Conversions API. Never throws; without
 * credentials it does nothing. Logs carry no tokens and no personal data.
 */
export async function sendCapiEvent(event: CapiEvent): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token || !/^\d+$/.test(pixelId)) return;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: event.sourceUrl || undefined,
        user_data: { ...hashedUserData(event), ...plainUserData(event) },
        custom_data: event.customData,
      },
    ],
  };
  const testCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testCode) body.test_event_code = testCode;

  try {
    const response = await fetch(`${GRAPH_URL}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { error?: { code?: number; error_subcode?: number } } | null;
      console.error(
        `[meta-capi] ${event.name} rejected: HTTP ${response.status}`,
        detail?.error ? `code=${detail.error.code} subcode=${detail.error.error_subcode}` : "",
      );
    }
  } catch (error) {
    console.error(`[meta-capi] ${event.name} failed:`, error instanceof Error ? error.name : "unknown error");
  }
}
