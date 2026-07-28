export type NewsPageSettings = {
  heroImage: string;
  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSummary: string;
  heroImageAlt: string;
  emptyBadgeNumber: string;
  emptyBadgeLabel: string;
};

export const defaultNewsSettings: NewsPageSettings = {
  heroImage: "/uploads/images/services/support-services/hero.jpg",
  heroKicker: "News & updates",
  heroTitleLine1: "The latest from",
  heroTitleLine2: "Servicelink.",
  heroSummary:
    "The latest from Servicelink on facilities management, service delivery, and operational excellence across Sydney and NSW.",
  heroImageAlt:
    "Servicelink team delivering facilities management services across NSW",
  emptyBadgeNumber: "18",
  emptyBadgeLabel: "Years of service",
};

export function parseNewsSettings(
  raw: string | null | undefined,
): NewsPageSettings {
  if (!raw?.trim()) return defaultNewsSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<NewsPageSettings>;
    return {
      ...defaultNewsSettings,
      ...parsed,
    };
  } catch {
    return defaultNewsSettings;
  }
}
