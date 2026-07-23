import { and, asc, eq, or } from "drizzle-orm";
import servicesContent from "@/data/services-content.json";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { seoServices } from "@/lib/db/schema";

export type ServiceHighlight = {
  title: string;
  detail: string;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  highlights: ServiceHighlight[];
};

export const services: Service[] = servicesContent as Service[];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/**
 * Services shown on the public site. Honours admin SEO Services → Published.
 * Falls back to the static catalogue when the DB is unavailable.
 */
export async function getPublishedServices(): Promise<Service[]> {
  if (!isDatabaseConfigured()) {
    return services;
  }

  try {
    const rows = await getDb()
      .select({
        slug: seoServices.slug,
        linkedServiceSlug: seoServices.linkedServiceSlug,
        sortOrder: seoServices.sortOrder,
      })
      .from(seoServices)
      .where(eq(seoServices.published, true))
      .orderBy(asc(seoServices.sortOrder));

    if (rows.length === 0) {
      return [];
    }

    const bySlug = new Map(services.map((service) => [service.slug, service]));
    const ordered: Service[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const key = row.linkedServiceSlug?.trim() || row.slug;
      if (!key || seen.has(key)) continue;
      const service = bySlug.get(key);
      if (!service) continue;
      seen.add(key);
      ordered.push(service);
    }

    return ordered;
  } catch {
    return services;
  }
}

export async function isServicePublished(slug: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return services.some((service) => service.slug === slug);
  }

  try {
    const [row] = await getDb()
      .select({ id: seoServices.id })
      .from(seoServices)
      .where(
        and(
          eq(seoServices.published, true),
          or(eq(seoServices.linkedServiceSlug, slug), eq(seoServices.slug, slug)),
        ),
      )
      .limit(1);

    return Boolean(row);
  } catch {
    return services.some((service) => service.slug === slug);
  }
}
