export type Service360Settings = {
  heroImage: string;
  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSummary: string;
  badgeNumber: string;
  badgeLabel: string;
};

export const defaultService360Settings: Service360Settings = {
  heroImage: "/uploads/images/services/facilities-management/hero.jpg",
  heroKicker: "Platform",
  heroTitleLine1: "Service360",
  heroTitleLine2: "every site.",
  heroSummary:
    "The technology powering every Servicelink service. One platform. Every site. Complete operational visibility.",
  badgeNumber: "194+",
  badgeLabel: "Active sites",
};

export function parseService360Settings(
  raw: string | null | undefined,
): Service360Settings {
  if (!raw?.trim()) return defaultService360Settings;

  try {
    const parsed = JSON.parse(raw) as Partial<Service360Settings>;
    return {
      ...defaultService360Settings,
      ...parsed,
    };
  } catch {
    return defaultService360Settings;
  }
}
