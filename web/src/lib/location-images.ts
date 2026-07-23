import { and, eq, isNull } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  locationServiceImages,
  locations,
  seoServices,
  type SeoPage,
} from "@/lib/db/schema";
import type { SeoPageRecord } from "@/lib/seo-content";
import { getServiceCardImages, getServiceImage } from "@/site/data";
import { isInternalImagePath } from "@/lib/service-image-paths";

export type ResolvedLocationImages = {
  heroImage: string;
  cardImages: string[];
};

export function parseCardImages(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  } catch {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

export function serializeCardImages(urls: string[]): string | null {
  const cleaned = urls.map((url) => url.trim()).filter(Boolean);
  return cleaned.length ? JSON.stringify(cleaned) : null;
}

function codeFallback(linkedServiceSlug?: string | null): ResolvedLocationImages {
  const slug = linkedServiceSlug ?? "facilities-management";
  const cardImages = getServiceCardImages(slug);
  return {
    heroImage: cardImages[0] ?? getServiceImage(slug),
    cardImages,
  };
}

function sanitizeImagePath(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || !isInternalImagePath(trimmed)) return null;
  return trimmed;
}

function sanitizeCardImages(raw: string | null | undefined) {
  return parseCardImages(raw).filter((url) => isInternalImagePath(url));
}

function fromOverride(
  heroImage: string | null | undefined,
  cardImagesRaw: string | null | undefined,
  linkedServiceSlug?: string | null,
): ResolvedLocationImages | null {
  const cardImages = sanitizeCardImages(cardImagesRaw);
  const hero = sanitizeImagePath(heroImage);

  if (hero && cardImages.length) {
    return { heroImage: hero, cardImages };
  }

  if (hero) {
    return { heroImage: hero, cardImages: [hero] };
  }

  if (cardImages.length) {
    return { heroImage: cardImages[0], cardImages };
  }

  return linkedServiceSlug ? null : null;
}

async function getLocationServiceOverride(
  cityId: string,
  metroId: string | null,
  seoServiceId: string,
) {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();

  if (metroId) {
    const [metroOverride] = await db
      .select()
      .from(locationServiceImages)
      .where(
        and(
          eq(locationServiceImages.cityId, cityId),
          eq(locationServiceImages.metroId, metroId),
          eq(locationServiceImages.seoServiceId, seoServiceId),
        ),
      )
      .limit(1);

    if (metroOverride) return metroOverride;
  }

  const [cityOverride] = await db
    .select()
    .from(locationServiceImages)
    .where(
      and(
        eq(locationServiceImages.cityId, cityId),
        isNull(locationServiceImages.metroId),
        eq(locationServiceImages.seoServiceId, seoServiceId),
      ),
    )
    .limit(1);

  return cityOverride ?? null;
}

async function getSeoServiceDefaults(seoServiceId: string) {
  if (!isDatabaseConfigured()) return null;

  const [service] = await getDb()
    .select({
      heroImage: seoServices.heroImage,
      cardImages: seoServices.cardImages,
      linkedServiceSlug: seoServices.linkedServiceSlug,
    })
    .from(seoServices)
    .where(eq(seoServices.id, seoServiceId))
    .limit(1);

  return service ?? null;
}

export async function resolveServiceImages(
  cityId: string,
  metroId: string | null,
  seoServiceId: string,
  linkedServiceSlug?: string | null,
): Promise<ResolvedLocationImages> {
  const override = await getLocationServiceOverride(cityId, metroId, seoServiceId);
  const fromLocation = fromOverride(
    override?.heroImage,
    override?.cardImages,
    linkedServiceSlug,
  );
  if (fromLocation) return fromLocation;

  const defaults = await getSeoServiceDefaults(seoServiceId);
  const fromService = fromOverride(
    defaults?.heroImage,
    defaults?.cardImages,
    defaults?.linkedServiceSlug ?? linkedServiceSlug,
  );
  if (fromService) return fromService;

  return codeFallback(defaults?.linkedServiceSlug ?? linkedServiceSlug);
}

export async function resolveLocationPageImages(
  page: SeoPageRecord & Pick<SeoPage, "heroImage" | "cardImages">,
): Promise<ResolvedLocationImages> {
  const pageOverride = fromOverride(
    page.heroImage,
    page.cardImages,
    page.service?.linkedServiceSlug,
  );
  if (pageOverride) return pageOverride;

  if (page.seoServiceId) {
    return resolveServiceImages(
      page.cityId,
      page.metroId,
      page.seoServiceId,
      page.service?.linkedServiceSlug,
    );
  }

  if (page.pageType === "metro_hub" && page.metro?.heroImage?.trim()) {
    const hero = sanitizeImagePath(page.metro.heroImage);
    if (hero) return { heroImage: hero, cardImages: [hero] };
  }

  if (page.city.heroImage?.trim()) {
    const hero = sanitizeImagePath(page.city.heroImage);
    if (hero) return { heroImage: hero, cardImages: [hero] };
  }

  return codeFallback("facilities-management");
}

export async function resolveHubHeroImage(
  cityId: string,
  metroId: string | null,
): Promise<string> {
  if (!isDatabaseConfigured()) {
    return getServiceImage("facilities-management");
  }

  const db = getDb();

  if (metroId) {
    const [metro] = await db
      .select({ heroImage: locations.heroImage })
      .from(locations)
      .where(eq(locations.id, metroId))
      .limit(1);

    if (metro?.heroImage?.trim()) {
      const hero = sanitizeImagePath(metro.heroImage);
      if (hero) return hero;
    }
  }

  const [city] = await db
    .select({ heroImage: locations.heroImage })
    .from(locations)
    .where(eq(locations.id, cityId))
    .limit(1);

  if (city?.heroImage?.trim()) {
    const hero = sanitizeImagePath(city.heroImage);
    if (hero) return hero;
  }

  return getServiceImage("facilities-management");
}
