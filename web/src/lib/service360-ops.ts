export type Service360OpsStats = {
  sitesCount: number;
  liveSitesCount: number;
  newReportsCount: number;
  /** All non-deleted faults created in the last 7 days (= new) */
  openFaultsCount: number;
  /** PENDING + INPROGRESS created this calendar month (= in progress) */
  pendingFaultsCount: number;
  /** All non-deleted faults from previous months (= fixed) */
  fixedFaultsCount: number;
  openTicketsCount: number;
  completedReportsLast30Days: number;
  faultsLast30Days: number;
  updatedAt: string;
};

const DEFAULT_STATS: Service360OpsStats = {
  sitesCount: 0,
  liveSitesCount: 0,
  newReportsCount: 0,
  openFaultsCount: 0,
  pendingFaultsCount: 0,
  fixedFaultsCount: 0,
  openTicketsCount: 0,
  completedReportsLast30Days: 0,
  faultsLast30Days: 0,
  updatedAt: new Date(0).toISOString(),
};

function apiBaseUrl() {
  return (process.env.SERVICE360_API_URL ?? "http://127.0.0.1:5301").replace(/\/$/, "");
}

function apiKey() {
  return process.env.SERVICE360_STATS_API_KEY?.trim() ?? "";
}

/**
 * Read-only ops totals from Service360 API (`GET /v1/public/ops-stats`).
 * Falls back to zeros if the API is unreachable so the marketing site still renders.
 */
export async function getService360OpsStats(): Promise<Service360OpsStats> {
  const url = `${apiBaseUrl()}/v1/public/ops-stats`;
  const headers: HeadersInit = { Accept: "application/json" };
  const key = apiKey();
  if (key) headers["x-api-key"] = key;

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`[service360-ops] ${response.status} from ${url}`);
      return DEFAULT_STATS;
    }

    const payload = (await response.json()) as {
      code?: number;
      data?: Partial<Service360OpsStats>;
    };

    if (payload.code !== 1 || !payload.data) {
      console.error("[service360-ops] unexpected payload", payload);
      return DEFAULT_STATS;
    }

    return {
      ...DEFAULT_STATS,
      ...payload.data,
    };
  } catch (err) {
    console.error("[service360-ops] fetch failed", err);
    return DEFAULT_STATS;
  }
}

export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value.toLocaleString("en-AU");
}

/** Display like "370+" when the count is large enough for marketing. */
export function formatSitesBadge(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 100) return `${value}+`;
  return String(value);
}
