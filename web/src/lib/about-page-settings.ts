import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import {
  ABOUT_PAGE_SLUG,
  defaultAboutSettings,
  parseAboutSettings,
  type AboutPageSettings,
} from "@/lib/about-page";

export async function getAboutPageSettings(): Promise<AboutPageSettings> {
  if (!isDatabaseConfigured()) return defaultAboutSettings;

  const [page] = await getDb()
    .select({ settings: sitePages.settings })
    .from(sitePages)
    .where(eq(sitePages.slug, ABOUT_PAGE_SLUG))
    .limit(1);

  return parseAboutSettings(page?.settings);
}
