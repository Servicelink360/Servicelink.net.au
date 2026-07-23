import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import {
  defaultHomepageSettings,
  parseHomepageSettings,
  type HomepageSettings,
} from "@/lib/homepage";
import { HOME_PAGE_SLUG } from "@/lib/site-pages";

export async function getHomepageSettings(): Promise<HomepageSettings> {
  if (!isDatabaseConfigured()) return defaultHomepageSettings;

  const [page] = await getDb()
    .select({ settings: sitePages.settings })
    .from(sitePages)
    .where(eq(sitePages.slug, HOME_PAGE_SLUG))
    .limit(1);

  return parseHomepageSettings(page?.settings);
}
