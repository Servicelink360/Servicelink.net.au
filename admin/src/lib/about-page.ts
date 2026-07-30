export type AboutPageSettings = {
  heroImage: string;
  heroImageAlt: string;
};

export const ABOUT_PAGE_SLUG = "about";

export const defaultAboutSettings: AboutPageSettings = {
  heroImage: "/uploads/images/services/facilities-management/hero.jpg",
  heroImageAlt:
    "Servicelink facilities management at a commercial site in Sydney",
};

export function parseAboutSettings(
  raw: string | null | undefined,
): AboutPageSettings {
  if (!raw?.trim()) return defaultAboutSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<AboutPageSettings>;
    return {
      ...defaultAboutSettings,
      ...parsed,
    };
  } catch {
    return defaultAboutSettings;
  }
}
