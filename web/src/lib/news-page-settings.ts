import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import {
  NEWS_PAGE_SLUG,
  defaultNewsSettings,
  parseNewsSettings,
  type NewsPageSettings,
} from "@/lib/news-page";

export async function getNewsPageSettings(): Promise<NewsPageSettings> {
  if (!isDatabaseConfigured()) return defaultNewsSettings;

  const [page] = await getDb()
    .select({ settings: sitePages.settings })
    .from(sitePages)
    .where(eq(sitePages.slug, NEWS_PAGE_SLUG))
    .limit(1);

  return parseNewsSettings(page?.settings);
}
