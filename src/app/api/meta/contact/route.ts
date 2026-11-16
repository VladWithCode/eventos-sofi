import { after } from "next/server";
import { z } from "zod";
import { sendCapiEvent } from "@/lib/meta/capi";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestContext } from "@/lib/request";

const MAX_BODY_BYTES = 2048;

const bodySchema = z.strictObject({
  eventId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  method: z.enum(["whatsapp", "phone", "instagram", "facebook"]),
  sourceUrl: z.url({ protocol: /^https?$/ }).max(2000),
});

function isSameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Server-side mirror of Pixel `Contact` clicks (sendBeacon). Stores nothing. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response(null, { status: 403 });

  const context = await getRequestContext();
  if (!rateLimit(`contact-click:${context.ip}`, 20, 10 * 60_000)) return new Response(null, { status: 429 });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return new Response(null, { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let parsed;
  try {
    parsed = bodySchema.safeParse(JSON.parse(text));
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!parsed.success) return new Response(null, { status: 400 });

  const { eventId, method, sourceUrl } = parsed.data;
  after(() =>
    sendCapiEvent({ name: "Contact", eventId, sourceUrl, request: context, customData: { method } }),
  );
  return new Response(null, { status: 204 });
}
