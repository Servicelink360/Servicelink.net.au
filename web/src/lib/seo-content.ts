import { and, asc, desc, eq, isNotNull, isNull, ne, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  locations,
  newsPosts,
  seoPages,
  seoServices,
  type Location,
  type NewsPost,
  type SeoPage,
  type SeoService,
} from "@/lib/db/schema";
import { resolveServiceImages } from "@/lib/location-images";

export type SeoPageRecord = SeoPage & {
  city: Location;
  metro: Location | null;
  service: SeoService | null;
};

export type SeoPageLink = {
  path: string;
  h1: string;
  metaDescription: string;
  serviceName?: string;
  linkedServiceSlug?: string | null;
  seoServiceId?: string;
  heroImage?: string;
  cardImages?: string[];
};

export type SeoLinkedSections = {
  metroLinks: SeoPageLink[];
  serviceLinks: SeoPageLink[];
};

async function toServiceLinkWithImages(
  page: SeoPage,
  service: {
    id: string;
    name: string;
    linkedServiceSlug: string | null;
  },
  cityId: string,
  metroId: string | null,
): Promise<SeoPageLink> {
  const images = await resolveServiceImages(
    cityId,
    metroId,
    service.id,
    service.linkedServiceSlug,
  );

  return {
    path: page.path,
    h1: page.h1,
    metaDescription: page.metaDescription,
    serviceName: service.name,
    linkedServiceSlug: service.linkedServiceSlug,
    seoServiceId: service.id,
    heroImage: images.heroImage,
    cardImages: images.cardImages,
  };
}

function toMetroLink(
  page: SeoPage,
  metroName: string,
  cityName: string,
): SeoPageLink {
  return {
    path: page.path,
    h1: `${metroName}, ${cityName}`,
    metaDescription: page.metaDescription,
  };
}

export async function getPublishedCities() {
  if (!isDatabaseConfigured()) return [];

  try {
    return await getDb()
      .select()
      .from(locations)
      .where(and(eq(locations.type, "city"), eq(locations.published, true)))
      .orderBy(asc(locations.sortOrder), asc(locations.name));
  } catch {
    return [];
  }
}

export async function getPublishedMetrosForCity(cityId: string) {
  if (!isDatabaseConfigured()) return [];

  return getDb()
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.type, "metro"),
        eq(locations.parentId, cityId),
        eq(locations.published, true),
      ),
    )
    .orderBy(asc(locations.sortOrder), asc(locations.name));
}

export async function getPublishedSeoServices() {
  if (!isDatabaseConfigured()) return [];

  return getDb()
    .select()
    .from(seoServices)
    .where(eq(seoServices.published, true))
    .orderBy(asc(seoServices.sortOrder), asc(seoServices.name));
}

export async function getSeoPageByPath(path: string): Promise<SeoPageRecord | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const db = getDb();
    const [page] = await db
      .select()
      .from(seoPages)
      .where(and(eq(seoPages.path, path), eq(seoPages.published, true)))
      .limit(1);

    if (!page) return null;

    const [city] = await db
      .select()
      .from(locations)
      .where(and(eq(locations.id, page.cityId), eq(locations.type, "city")))
      .limit(1);

    if (!city || !city.published) return null;

    let metro: Location | null = null;
    if (page.metroId) {
      const [metroRow] = await db
        .select()
        .from(locations)
        .where(
          and(
            eq(locations.id, page.metroId),
            eq(locations.type, "metro"),
            eq(locations.parentId, page.cityId),
            eq(locations.published, true),
          ),
        )
        .limit(1);

      if (!metroRow) return null;
      metro = metroRow;
    }

    const service = page.seoServiceId
      ? (
          await db
            .select()
            .from(seoServices)
            .where(
              and(
                eq(seoServices.id, page.seoServiceId),
                eq(seoServices.published, true),
              ),
            )
            .limit(1)
        )[0] ?? null
      : null;

    if (page.seoServiceId && !service) return null;

    return { ...page, city, metro, service };
  } catch {
    return null;
  }
}

export async function getPublishedSeoPagePaths() {
  if (!isDatabaseConfigured()) return [];

  try {
    const cityLoc = alias(locations, "city_loc");
    const metroLoc = alias(locations, "metro_loc");

    return await getDb()
      .select({
        path: seoPages.path,
        updatedAt: seoPages.updatedAt,
        pageType: seoPages.pageType,
      })
      .from(seoPages)
      .innerJoin(
        cityLoc,
        and(eq(seoPages.cityId, cityLoc.id), eq(cityLoc.published, true)),
      )
      .leftJoin(metroLoc, eq(seoPages.metroId, metroLoc.id))
      .leftJoin(seoServices, eq(seoPages.seoServiceId, seoServices.id))
      .where(
        and(
          eq(seoPages.published, true),
          eq(seoPages.noIndex, false),
          or(isNull(seoPages.metroId), eq(metroLoc.published, true)),
          or(isNull(seoPages.seoServiceId), eq(seoServices.published, true)),
        ),
      );
  } catch {
    return [];
  }
}

export async function getLinkedSeoPages(page: SeoPageRecord): Promise<SeoLinkedSections> {
  if (!isDatabaseConfigured()) {
    return { metroLinks: [], serviceLinks: [] };
  }

  const db = getDb();
  const linkedMetro = alias(locations, "linked_metro");
  const linkedService = alias(seoServices, "linked_service");
  const cityFilter = eq(seoPages.cityId, page.cityId);
  const publishedFilter = eq(seoPages.published, true);
  const publishedMetroFilter = eq(linkedMetro.published, true);
  const publishedServiceFilter = eq(linkedService.published, true);
  const excludeSelf = ne(seoPages.path, page.path);

  if (page.pageType === "city_hub") {
    const metroRows = await db
      .select({
        page: seoPages,
        metroName: linkedMetro.name,
      })
      .from(seoPages)
      .innerJoin(linkedMetro, eq(seoPages.metroId, linkedMetro.id))
      .where(
        and(
          cityFilter,
          publishedFilter,
          publishedMetroFilter,
          excludeSelf,
          isNotNull(seoPages.metroId),
          isNull(seoPages.seoServiceId),
        ),
      )
      .orderBy(asc(linkedMetro.sortOrder), asc(linkedMetro.name));

    const serviceRows = await db
      .select({
        page: seoPages,
        serviceId: linkedService.id,
        serviceName: linkedService.name,
        linkedServiceSlug: linkedService.linkedServiceSlug,
      })
      .from(seoPages)
      .innerJoin(linkedService, eq(seoPages.seoServiceId, linkedService.id))
      .where(
        and(
          cityFilter,
          publishedFilter,
          publishedServiceFilter,
          excludeSelf,
          isNull(seoPages.metroId),
          isNotNull(seoPages.seoServiceId),
        ),
      )
      .orderBy(asc(linkedService.sortOrder), asc(linkedService.name));

    return {
      metroLinks: metroRows.map(({ page: metroPage, metroName }) =>
        toMetroLink(metroPage, metroName, page.city.name),
      ),
      serviceLinks: await Promise.all(
        serviceRows.map(({ page: servicePage, serviceId, serviceName, linkedServiceSlug }) =>
          toServiceLinkWithImages(
            servicePage,
            { id: serviceId, name: serviceName, linkedServiceSlug },
            page.cityId,
            null,
          ),
        ),
      ),
    };
  }

  if (page.pageType === "metro_hub" && page.metroId) {
    const serviceRows = await db
      .select({
        page: seoPages,
        serviceId: linkedService.id,
        serviceName: linkedService.name,
        linkedServiceSlug: linkedService.linkedServiceSlug,
      })
      .from(seoPages)
      .innerJoin(linkedService, eq(seoPages.seoServiceId, linkedService.id))
      .where(
        and(
          cityFilter,
          publishedFilter,
          publishedServiceFilter,
          excludeSelf,
          eq(seoPages.metroId, page.metroId),
          isNotNull(seoPages.seoServiceId),
        ),
      )
      .orderBy(asc(linkedService.sortOrder), asc(linkedService.name));

    return {
      metroLinks: [],
      serviceLinks: await Promise.all(
        serviceRows.map(({ page: servicePage, serviceId, serviceName, linkedServiceSlug }) =>
          toServiceLinkWithImages(
            servicePage,
            { id: serviceId, name: serviceName, linkedServiceSlug },
            page.cityId,
            page.metroId,
          ),
        ),
      ),
    };
  }

  if (page.pageType === "city_service" && page.seoServiceId) {
    const metroRows = await db
      .select({
        page: seoPages,
        metroName: linkedMetro.name,
      })
      .from(seoPages)
      .innerJoin(linkedMetro, eq(seoPages.metroId, linkedMetro.id))
      .where(
        and(
          cityFilter,
          publishedFilter,
          publishedMetroFilter,
          excludeSelf,
          isNotNull(seoPages.metroId),
          eq(seoPages.seoServiceId, page.seoServiceId),
        ),
      )
      .orderBy(asc(linkedMetro.sortOrder), asc(linkedMetro.name));

    const serviceRows = await db
      .select({
        page: seoPages,
        serviceId: linkedService.id,
        serviceName: linkedService.name,
        linkedServiceSlug: linkedService.linkedServiceSlug,
      })
      .from(seoPages)
      .innerJoin(linkedService, eq(seoPages.seoServiceId, linkedService.id))
      .where(
        and(
          cityFilter,
          publishedFilter,
          publishedServiceFilter,
          excludeSelf,
          isNull(seoPages.metroId),
          isNotNull(seoPages.seoServiceId),
          ne(seoPages.seoServiceId, page.seoServiceId),
        ),
      )
      .orderBy(asc(linkedService.sortOrder), asc(linkedService.name));

    return {
      metroLinks: metroRows.map(({ page: metroPage, metroName }) =>
        toMetroLink(metroPage, metroName, page.city.name),
      ),
      serviceLinks: await Promise.all(
        serviceRows.map(({ page: servicePage, serviceId, serviceName, linkedServiceSlug }) =>
          toServiceLinkWithImages(
            servicePage,
            { id: serviceId, name: serviceName, linkedServiceSlug },
            page.cityId,
            null,
          ),
        ),
      ),
    };
  }

  if (page.pageType === "metro_service" && page.metroId && page.seoServiceId) {
    const serviceRows = await db
      .select({
        page: seoPages,
        serviceId: linkedService.id,
        serviceName: linkedService.name,
        linkedServiceSlug: linkedService.linkedServiceSlug,
      })
      .from(seoPages)
      .innerJoin(linkedService, eq(seoPages.seoServiceId, linkedService.id))
      .where(
        and(
          cityFilter,
          publishedFilter,
          publishedServiceFilter,
          excludeSelf,
          eq(seoPages.metroId, page.metroId),
          isNotNull(seoPages.seoServiceId),
          ne(seoPages.seoServiceId, page.seoServiceId),
        ),
      )
      .orderBy(asc(linkedService.sortOrder), asc(linkedService.name));

    return {
      metroLinks: [],
      serviceLinks: await Promise.all(
        serviceRows.map(({ page: servicePage, serviceId, serviceName, linkedServiceSlug }) =>
          toServiceLinkWithImages(
            servicePage,
            { id: serviceId, name: serviceName, linkedServiceSlug },
            page.cityId,
            page.metroId,
          ),
        ),
      ),
    };
  }

  return { metroLinks: [], serviceLinks: [] };
}

export async function getPublishedNewsPosts() {
  if (!isDatabaseConfigured()) return [];

  return getDb()
    .select()
    .from(newsPosts)
    .where(eq(newsPosts.published, true))
    .orderBy(desc(newsPosts.publishedAt));
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  if (!isDatabaseConfigured()) return null;

  const [post] = await getDb()
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.slug, slug), eq(newsPosts.published, true)))
    .limit(1);

  return post ?? null;
}

export async function getPublishedNewsSlugs() {
  if (!isDatabaseConfigured()) return [];

  return getDb()
    .select({
      slug: newsPosts.slug,
      updatedAt: newsPosts.updatedAt,
      publishedAt: newsPosts.publishedAt,
    })
    .from(newsPosts)
    .where(eq(newsPosts.published, true));
}

export function seoPageUrl(path: string) {
  return `/locations/${path}`;
}
