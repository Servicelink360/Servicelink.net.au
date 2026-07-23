import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { HOME_PAGE_SLUG } from "@/lib/site-pages";

export default async function HomepageRedirectPage() {
  const [page] = await getDb()
    .select({ id: sitePages.id })
    .from(sitePages)
    .where(eq(sitePages.slug, HOME_PAGE_SLUG))
    .limit(1);

  redirect(page ? `/dashboard/pages/${page.id}` : "/dashboard/pages");
}
