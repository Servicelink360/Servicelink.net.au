import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { statsExcludeIps } from "@/lib/db/schema";

export const STATS_EXCLUDE_COOKIE = "sl_no_stats";

export function clientIpFromHeaders(headerStore: Headers) {
  const forwarded = headerStore.get("x-forwarded-for") ?? "";
  const raw =
    forwarded.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    headerStore.get("cf-connecting-ip")?.trim() ||
    "";
  return raw.replace(/^::ffff:/, "");
}

function shouldSkipIp(ip: string) {
  return (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "187.77.143.132"
  );
}

export async function rememberAdminComputer() {
  try {
    const ip = clientIpFromHeaders(await headers());
    if (shouldSkipIp(ip)) return;
    await getDb()
      .insert(statsExcludeIps)
      .values({ ip })
      .onConflictDoUpdate({
        target: statsExcludeIps.ip,
        set: { updatedAt: sql`now()` },
      });
  } catch {
    // Stats exclusion must never break admin.
  }
}
