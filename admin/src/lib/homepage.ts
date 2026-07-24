export const HOMEPAGE_SETTINGS_KEY = "homepage";

export type HomepageSettings = {
  heroMainImage: string;
  heroAccentImage: string;
  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  statNumber: string;
  statLabel: string;
};

export const defaultHomepageSettings: HomepageSettings = {
  heroMainImage: "/uploads/images/site/hero-main.jpg",
  heroAccentImage: "/uploads/images/site/hero-accent.jpg",
  heroKicker: "Your Partner in Facilities",
  heroTitleLine1: "Your buildings.",
  heroTitleLine2: "Our responsibility.",
  heroSubtitle:
    "Servicelink delivers end-to-end facility operations for organisations that refuse to compromise — one partner, total accountability, measurable performance.",
  statNumber: "340+",
  statLabel: "Active sites managed across Australia",
};

export function parseHomepageSettings(raw: string | null | undefined): HomepageSettings {
  if (!raw?.trim()) return defaultHomepageSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<HomepageSettings>;
    return {
      ...defaultHomepageSettings,
      ...parsed,
    };
  } catch {
    return defaultHomepageSettings;
  }
}
