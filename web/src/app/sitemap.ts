import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { legalPages } from "@/lib/legal";
import { getPublishedServices } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";
import { getPublishedSeoPagePaths } from "@/lib/seo-content";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function seoPagePriority(pageType: string): number {
  switch (pageType) {
    case "city_hub":
      return 0.85;
    case "metro_hub":
      return 0.8;
    case "city_service":
      return 0.75;
    case "metro_service":
      return 0.7;
    default:
      return 0.7;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.9 },
    {
      url: absoluteUrl("/service360"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    { url: absoluteUrl("/join"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/quote"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/news"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/locations"), changeFrequency: "weekly", priority: 0.9 },
  ];

  const publishedServices = await getPublishedServices();
  const serviceRoutes: MetadataRoute.Sitemap = publishedServices.map((service) => ({
    url: absoluteUrl(`/services/${service.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const legalRoutes: MetadataRoute.Sitemap = legalPages.map((page) => ({
    url: absoluteUrl(`/legal/${page.slug}`),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  let newsRoutes: MetadataRoute.Sitemap = [];
  let locationRoutes: MetadataRoute.Sitemap = [];

  if (isDatabaseConfigured()) {
    try {
      const posts = await getDb()
        .select({
          slug: newsPosts.slug,
          publishedAt: newsPosts.publishedAt,
          updatedAt: newsPosts.updatedAt,
        })
        .from(newsPosts)
        .where(eq(newsPosts.published, true));

      newsRoutes = posts.map((post) => ({
        url: absoluteUrl(`/news/${post.slug}`),
        lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      }));

      const pages = await getPublishedSeoPagePaths();

      locationRoutes = pages.map((page) => ({
        url: absoluteUrl(`/locations/${page.path}`),
        lastModified: page.updatedAt ?? undefined,
        changeFrequency: "monthly",
        priority: seoPagePriority(page.pageType),
      }));
    } catch {
      // Sitemap should still publish when the database is temporarily unavailable.
    }
  }

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...legalRoutes,
    ...newsRoutes,
    ...locationRoutes,
  ].filter((entry) => entry.url.startsWith(site.url));
}
