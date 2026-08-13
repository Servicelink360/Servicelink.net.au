import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { statsExcludeIps } from "@/lib/db/schema";

export const STATS_EXCLUDE_COOKIE = "sl_no_stats";

export function clientIpFromRequest(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const raw =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "";
  return raw.replace(/^::ffff:/, "");
}

export function hasStatsExcludeCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return new RegExp(`(?:^|;\\s*)${STATS_EXCLUDE_COOKIE}=1(?:;|$)`).test(cookie);
}

export async function isExcludedStatsIp(ip: string) {
  if (!ip) return false;
  const [row] = await getDb()
    .select({ ip: statsExcludeIps.ip })
    .from(statsExcludeIps)
    .where(eq(statsExcludeIps.ip, ip))
    .limit(1);
  return Boolean(row);
}

export function shouldSkipStatsClient() {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(STATS_EXCLUDE_COOKIE) === "1") return true;
  } catch {
    // Ignore blocked storage.
  }
  return document.cookie.split(";").some((part) => part.trim() === `${STATS_EXCLUDE_COOKIE}=1`);
}
