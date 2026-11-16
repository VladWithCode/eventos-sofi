import "server-only";
import { cookies, headers } from "next/headers";

export type RequestContext = {
  ip: string;
  userAgent: string;
  referer: string;
  fbp: string;
  fbc: string;
};

/**
 * Client details for rate limiting and Meta matching. The IP comes from the
 * reverse proxy headers, so the production proxy must set them (and strip
 * client-supplied values).
 */
export async function getRequestContext(): Promise<RequestContext> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || h.get("x-real-ip")?.trim() || "unknown",
    userAgent: h.get("user-agent") ?? "",
    referer: h.get("referer") ?? "",
    fbp: c.get("_fbp")?.value ?? "",
    fbc: c.get("_fbc")?.value ?? "",
  };
}
