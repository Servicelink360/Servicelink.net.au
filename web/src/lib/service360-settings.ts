import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { SERVICE_IMAGE_ROOT } from "./service-image-paths";

export const SERVICE360_PAGE_SLUG = "service360";

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
  heroImage: `${SERVICE_IMAGE_ROOT}/facilities-management/hero.jpg`,
  heroKicker: "Platform",
  heroTitleLine1: "Service360",
  heroTitleLine2: "every site.",
  heroSummary:
    "The technology powering every Servicelink service. One platform. Every site. Complete operational visibility.",
  badgeNumber: "370+",
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

export async function getService360Settings(): Promise<Service360Settings> {
  if (!isDatabaseConfigured()) return defaultService360Settings;

  const [page] = await getDb()
    .select({ settings: sitePages.settings })
    .from(sitePages)
    .where(eq(sitePages.slug, SERVICE360_PAGE_SLUG))
    .limit(1);

  return parseService360Settings(page?.settings);
}
