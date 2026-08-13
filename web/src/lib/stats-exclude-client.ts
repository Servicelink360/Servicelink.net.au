export const STATS_EXCLUDE_COOKIE = "sl_no_stats";

export function shouldSkipStatsClient() {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(STATS_EXCLUDE_COOKIE) === "1") return true;
  } catch {
    // Ignore blocked storage.
  }
  return document.cookie.split(";").some((part) => part.trim() === `${STATS_EXCLUDE_COOKIE}=1`);
}
