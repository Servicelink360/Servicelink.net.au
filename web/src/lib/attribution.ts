import { shouldSkipStatsClient } from "@/lib/stats-exclude";

export type AttributionPayload = {
  pagePath: string;
  landingPath: string;
  trafficReferrer: string;
  searchEngine: string;
};

const STORAGE_KEY = "sl_attribution";

const ENGINE_MATCHERS: [RegExp, string][] = [
  [/google\./i, "Google"],
  [/bing\./i, "Bing"],
  [/yahoo\./i, "Yahoo"],
  [/duckduckgo\./i, "DuckDuckGo"],
  [/baidu\./i, "Baidu"],
  [/yandex\./i, "Yandex"],
  [/ecosia\./i, "Ecosia"],
  [/brave\./i, "Brave"],
  [/facebook\.|fb\.com|instagram\./i, "Facebook"],
  [/linkedin\.|lnkd\.in/i, "LinkedIn"],
  [/twitter\.|t\.co$|x\.com/i, "X"],
  [/youtube\.|youtu\.be/i, "YouTube"],
  [/chatgpt\.|openai\./i, "ChatGPT"],
  [/perplexity\./i, "Perplexity"],
  [/copilot\.microsoft/i, "Copilot"],
];

function titleCaseSource(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function detectSearchEngine(referrer: string, utmSource = "") {
  const utm = utmSource.trim().toLowerCase();
  if (utm.includes("google")) return "Google";
  if (utm.includes("bing")) return "Bing";
  if (utm.includes("yahoo")) return "Yahoo";
  if (utm.includes("duckduckgo") || utm === "ddg") return "DuckDuckGo";
  if (utm.includes("facebook") || utm === "fb" || utm.includes("instagram")) {
    return "Facebook";
  }
  if (utm.includes("linkedin")) return "LinkedIn";
  if (utm.includes("chatgpt") || utm.includes("openai")) return "ChatGPT";
  if (utm.includes("perplexity")) return "Perplexity";

  if (!referrer) {
    return utm ? titleCaseSource(utmSource) : "Direct";
  }

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    for (const [pattern, label] of ENGINE_MATCHERS) {
      if (pattern.test(host)) return label;
    }
    return host || "Other";
  } catch {
    return utm ? titleCaseSource(utmSource) : "Direct";
  }
}

function currentPath() {
  return `${window.location.pathname}${window.location.search}`.slice(0, 512);
}

function externalReferrer() {
  const raw = document.referrer?.trim() ?? "";
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.hostname === window.location.hostname) return "";
    return raw.slice(0, 512);
  } catch {
    return "";
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return;

  const landingPath = currentPath();
  const referrer = externalReferrer();
  const utmSource = new URLSearchParams(window.location.search).get("utm_source") ?? "";

  try {
    const existingRaw = sessionStorage.getItem(STORAGE_KEY);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw) as {
        landingPath?: string;
        referrer?: string;
        searchEngine?: string;
        utmSource?: string;
      };
      if (utmSource && existing.searchEngine === "Direct") {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            utmSource,
            searchEngine: detectSearchEngine(existing.referrer ?? "", utmSource),
          }),
        );
      }
      return;
    }

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        landingPath,
        referrer,
        utmSource,
        searchEngine: detectSearchEngine(referrer, utmSource),
      }),
    );
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

export function getAttribution(): AttributionPayload {
  const pagePath = typeof window === "undefined" ? "" : currentPath();
  const empty: AttributionPayload = {
    pagePath,
    landingPath: pagePath,
    trafficReferrer: "",
    searchEngine: "Direct",
  };

  if (typeof window === "undefined") return empty;

  captureAttribution();

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const stored = JSON.parse(raw) as {
      landingPath?: string;
      referrer?: string;
      searchEngine?: string;
      utmSource?: string;
    };
    return {
      pagePath,
      landingPath: String(stored.landingPath || pagePath).slice(0, 512),
      trafficReferrer: String(stored.referrer || "").slice(0, 512),
      searchEngine: String(
        stored.searchEngine || detectSearchEngine(stored.referrer || "", stored.utmSource || ""),
      ).slice(0, 64),
    };
  } catch {
    return empty;
  }
}

const SESSION_KEY = "sl_visit_sid";
const LAST_VISIT_KEY = "sl_last_visit";

export function getVisitSessionId() {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "";
  }
}

export function trackPageView() {
  if (typeof window === "undefined") return;
  if (shouldSkipStatsClient()) return;
  captureAttribution();
  const attribution = getAttribution();
  const sessionId = getVisitSessionId();
  if (!sessionId || !attribution.pagePath.startsWith("/")) return;

  const stamp = `${attribution.pagePath}|${Math.floor(Date.now() / 4000)}`;
  try {
    if (sessionStorage.getItem(LAST_VISIT_KEY) === stamp) return;
    sessionStorage.setItem(LAST_VISIT_KEY, stamp);
  } catch {
    // Continue even if storage is blocked.
  }

  const payload = JSON.stringify({
    sessionId,
    ...attribution,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/visit",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch("/api/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
