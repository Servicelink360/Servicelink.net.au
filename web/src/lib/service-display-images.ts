import { eq, or } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { seoServices } from "@/lib/db/schema";
import { parseCardImages } from "@/lib/location-images";
import { isInternalImagePath } from "@/lib/service-image-paths";
import { getServiceCardImages, getServiceImage } from "@/site/data";

export type ServiceDisplayImages = {
  heroImage: string;
  cardImages: string[];
};

function sanitize(path: string | null | undefined) {
  const trimmed = path?.trim();
  if (!trimmed || !isInternalImagePath(trimmed)) return null;
  return trimmed;
}

/**
 * Resolve hero + card images for a public /services/[slug] page.
 * Prefers admin-uploaded seo_services images, falls back to code defaults.
 */
export async function getServiceDisplayImages(
  staticSlug: string,
): Promise<ServiceDisplayImages> {
  const fallback: ServiceDisplayImages = {
    heroImage: getServiceImage(staticSlug),
    cardImages: getServiceCardImages(staticSlug),
  };

  if (!isDatabaseConfigured()) return fallback;

  try {
    const [row] = await getDb()
      .select({
        heroImage: seoServices.heroImage,
        cardImages: seoServices.cardImages,
        linkedServiceSlug: seoServices.linkedServiceSlug,
        slug: seoServices.slug,
      })
      .from(seoServices)
      .where(
        or(
          eq(seoServices.linkedServiceSlug, staticSlug),
          eq(seoServices.slug, staticSlug),
        ),
      )
      .limit(1);

    if (!row) return fallback;

    const hero = sanitize(row.heroImage);
    const cards = parseCardImages(row.cardImages).filter((url) =>
      isInternalImagePath(url),
    );

    return {
      heroImage: hero ?? (cards[0] ?? fallback.heroImage),
      cardImages: cards.length > 0 ? cards : fallback.cardImages,
    };
  } catch {
    return fallback;
  }
}
