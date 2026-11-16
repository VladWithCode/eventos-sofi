import { z } from "zod";

const field = z.string().trim().max(2000).catch("");

const schema = z.object({
  utm_source: field,
  utm_medium: field,
  utm_campaign: field,
  utm_content: field,
  utm_term: field,
  placement: field,
  fbclid: field,
  landingUrl: field,
  referrer: field,
});

export type Attribution = z.infer<typeof schema>;

const EMPTY: Attribution = schema.parse({});

/** Parses the hidden `attribution` input. Never fails: bad input yields empty values. */
export function parseAttribution(raw: unknown): Attribution {
  if (typeof raw !== "string" || raw.length > 10_000) return EMPTY;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function attributionColumns(a: Attribution) {
  return {
    utm_source: a.utm_source,
    utm_medium: a.utm_medium,
    utm_campaign: a.utm_campaign,
    utm_content: a.utm_content,
    utm_term: a.utm_term,
    placement: a.placement,
    fbclid: a.fbclid,
    landing_url: a.landingUrl,
    referrer: a.referrer,
  };
}

export function attributionFromRow(row: Record<string, unknown>): Attribution {
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    utm_source: s(row.utm_source),
    utm_medium: s(row.utm_medium),
    utm_campaign: s(row.utm_campaign),
    utm_content: s(row.utm_content),
    utm_term: s(row.utm_term),
    placement: s(row.placement),
    fbclid: s(row.fbclid),
    landingUrl: s(row.landing_url),
    referrer: s(row.referrer),
  };
}
