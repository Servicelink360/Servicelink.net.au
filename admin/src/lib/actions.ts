"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  contactMessages,
  locationServiceImages,
  locations,
  newsPosts,
  seoPages,
  seoServices,
  sitePages,
  siteSettings,
  subscribers,
  users,
} from "@/lib/db/schema";
import { cardImagesFromTextarea } from "@/lib/location-images";
import { assertInternalImageUrl, assertInternalImageUrls } from "@/lib/image-url";
import { requireAdminSession } from "@/lib/auth";
import {
  buildSeoPageContent,
  buildSeoPath,
  inferSeoPageType,
  type SeoPageType,
} from "@/lib/seo-templates";
import {
  parseHomepageSettings,
  type HomepageSettings,
} from "@/lib/homepage";
import {
  CLIENT_FEEDBACK_SETTINGS_KEY,
  normalizeClientFeedback,
} from "@/lib/client-feedback";
import {
  parseService360Settings,
  type Service360Settings,
} from "@/lib/service360";
import {
  HOME_PAGE_SLUG,
  NEWS_PAGE_SLUG,
  ABOUT_PAGE_SLUG,
  SERVICE360_PAGE_SLUG,
  isSystemSitePageSlug,
} from "@/lib/site-pages";
import {
  parseNewsSettings,
  type NewsPageSettings,
} from "@/lib/news-page";
import {
  parseAboutSettings,
  type AboutPageSettings,
} from "@/lib/about-page";

function optionalInternalHero(value: string | null | undefined, label: string) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  return assertInternalImageUrl(trimmed, label);
}

function optionalInternalCardImages(textarea: string, label: string) {
  const lines = textarea
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  return cardImagesFromTextarea(assertInternalImageUrls(lines, label).join("\n"));
}

function resolveSeoPageTarget(
  pageType: SeoPageType,
  citySlug: string,
  metroSlug?: string | null,
  serviceSlug?: string | null,
) {
  switch (pageType) {
    case "city_hub":
      return {
        pageType,
        path: buildSeoPath(citySlug),
        metroId: null as string | null,
        seoServiceId: null as string | null,
      };
    case "metro_hub":
      if (!metroSlug) throw new Error("Metro hub pages require a metro area.");
      return {
        pageType,
        path: buildSeoPath(citySlug, metroSlug),
        metroId: undefined,
        seoServiceId: null as string | null,
      };
    case "city_service":
      if (!serviceSlug) throw new Error("City service pages require an SEO service.");
      return {
        pageType,
        path: buildSeoPath(citySlug, null, serviceSlug),
        metroId: null as string | null,
        seoServiceId: undefined,
      };
    case "metro_service":
      if (!metroSlug || !serviceSlug) {
        throw new Error("Metro service pages require both a metro area and an SEO service.");
      }
      return {
        pageType,
        path: buildSeoPath(citySlug, metroSlug, serviceSlug),
        metroId: undefined,
        seoServiceId: undefined,
      };
  }
}
export async function deleteUser(id: string) {
  await requireAdminSession();
  await getDb().delete(users).where(eq(users.id, id));
  revalidatePath("/dashboard/users");
}

export async function deleteSubscriber(id: string) {
  await requireAdminSession();
  await getDb().delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/dashboard/subscribers");
}

export async function toggleSubscriber(id: string, active: boolean) {
  await requireAdminSession();
  await getDb().update(subscribers).set({ active }).where(eq(subscribers.id, id));
  revalidatePath("/dashboard/subscribers");
}

export async function deleteMessage(id: string) {
  await requireAdminSession();
  await getDb().delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/dashboard/messages");
}

export async function deleteNewsPost(id: string) {
  await requireAdminSession();
  await getDb().delete(newsPosts).where(eq(newsPosts.id, id));
  revalidatePath("/dashboard/news");
}

export async function deleteSitePage(id: string) {
  await requireAdminSession();
  const db = getDb();

  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  if (!page) return;

  if (isSystemSitePageSlug(page.slug)) {
    throw new Error("System pages cannot be deleted.");
  }

  await db.delete(sitePages).where(eq(sitePages.id, id));
  revalidatePath("/dashboard/pages");
}

export async function saveNewsPost(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const featuredImage = optionalInternalHero(
    String(formData.get("featuredImage") ?? ""),
    "Featured image",
  );
  const published = formData.get("published") === "on";

  if (!title || !slug || !summary || !body) {
    throw new Error("All fields are required.");
  }

  let publishedAt: Date | null = null;
  if (published) {
    if (id) {
      const [existing] = await db
        .select({ publishedAt: newsPosts.publishedAt, published: newsPosts.published })
        .from(newsPosts)
        .where(eq(newsPosts.id, id))
        .limit(1);
      publishedAt = existing?.published && existing.publishedAt ? existing.publishedAt : new Date();
    } else {
      publishedAt = new Date();
    }
  }

  const values = {
    title,
    slug,
    summary,
    body,
    metaTitle: metaTitle || null,
    metaDescription: metaDescription || null,
    featuredImage,
    published,
    publishedAt,
    updatedAt: new Date(),
  };
  if (id) {
    await db.update(newsPosts).set(values).where(eq(newsPosts.id, id));
  } else {
    await db.insert(newsPosts).values(values);
  }

  revalidatePath("/dashboard/news");
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  redirect("/dashboard/news");
}

export async function saveSitePage(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!title || !slug || !content) {
    throw new Error("All fields are required.");
  }

  const values = {
    title,
    slug,
    pageType: "standard",
    content,
    published,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(sitePages).set(values).where(eq(sitePages.id, id));
  } else {
    await db.insert(sitePages).values(values);
  }

  revalidatePath("/dashboard/pages");
  redirect("/dashboard/pages");
}

export async function deleteSeoService(id: string) {
  await requireAdminSession();
  await getDb().delete(seoServices).where(eq(seoServices.id, id));
  revalidatePath("/dashboard/seo-services");
}

export async function saveSeoService(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const linkedServiceSlug = String(formData.get("linkedServiceSlug") ?? "").trim() || null;
  const heroImage = optionalInternalHero(String(formData.get("heroImage") ?? ""), "Hero image");
  const cardImages = optionalInternalCardImages(
    String(formData.get("cardImages") ?? ""),
    "Card image",
  );
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const published = formData.get("published") === "on";

  if (!slug || !name || !summary || !description) {
    throw new Error("All SEO service fields are required.");
  }

  const values = {
    slug,
    name,
    summary,
    description,
    linkedServiceSlug,
    heroImage,
    cardImages,
    sortOrder,
    published,
  };

  if (id) {
    await db.update(seoServices).set(values).where(eq(seoServices.id, id));
  } else {
    await db.insert(seoServices).values(values);
  }

  revalidatePath("/dashboard/seo-services");
  // Public site pages that show service images (separate Next app reads DB live).
  revalidatePath(`/dashboard/seo-services/${id || ""}`);
  redirect("/dashboard/seo-services");
}

export async function deleteSeoPage(id: string) {
  await requireAdminSession();
  await getDb().delete(seoPages).where(eq(seoPages.id, id));
  revalidatePath("/dashboard/seo-pages");
}

/**
 * Publish or unpublish a location group (hub + all service pages) in one action.
 * Publishing also clears no_index so pages can appear in Google.
 */
export async function setSeoLocationGroupPublished(ids: string[], published: boolean) {
  await requireAdminSession();

  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.length === 0) {
    throw new Error("No pages selected.");
  }

  const db = getDb();
  const pages = await db
    .select({
      id: seoPages.id,
      path: seoPages.path,
      cityId: seoPages.cityId,
      metroId: seoPages.metroId,
    })
    .from(seoPages)
    .where(inArray(seoPages.id, uniqueIds));

  if (pages.length === 0) {
    throw new Error("No matching SEO pages found.");
  }

  await db
    .update(seoPages)
    .set({
      published,
      noIndex: !published,
      updatedAt: new Date(),
    })
    .where(inArray(seoPages.id, pages.map((page) => page.id)));

  revalidatePath("/dashboard/seo-pages");
  revalidatePath("/locations");
  revalidatePath("/sitemap.xml");

  const cityIds = [...new Set(pages.map((page) => page.cityId))];
  for (const cityId of cityIds) {
    const [city] = await db
      .select({ slug: locations.slug })
      .from(locations)
      .where(eq(locations.id, cityId))
      .limit(1);
    if (!city) continue;

    revalidatePath(`/locations/${city.slug}`);
    const metroIds = [
      ...new Set(
        pages
          .filter((page) => page.cityId === cityId && page.metroId)
          .map((page) => page.metroId as string),
      ),
    ];
    for (const metroId of metroIds) {
      const [metro] = await db
        .select({ slug: locations.slug })
        .from(locations)
        .where(eq(locations.id, metroId))
        .limit(1);
      if (metro) {
        revalidatePath(`/locations/${city.slug}/${metro.slug}`);
      }
    }
  }

  return { ok: true as const, count: pages.length, published };
}

export async function saveSeoPage(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "");
  const cityId = String(formData.get("cityId") ?? "").trim();
  const metroId = String(formData.get("metroId") ?? "").trim() || null;
  const seoServiceId = String(formData.get("seoServiceId") ?? "").trim() || null;
  const useTemplate = formData.get("useTemplate") === "on";
  const published = formData.get("published") === "on";
  const noIndex = formData.get("noIndex") === "on";

  if (!cityId) {
    throw new Error("City is required.");
  }

  const [city] = await db.select().from(locations).where(eq(locations.id, cityId)).limit(1);
  if (!city || city.type !== "city") throw new Error("City not found.");

  const metro = metroId
    ? (await db.select().from(locations).where(eq(locations.id, metroId)).limit(1))[0]
    : null;

  if (metro && (metro.type !== "metro" || metro.parentId !== cityId)) {
    throw new Error("Selected metro area does not belong to the chosen city.");
  }

  const service = seoServiceId
    ? (await db.select().from(seoServices).where(eq(seoServices.id, seoServiceId)).limit(1))[0]
    : null;

  let pageType: SeoPageType;
  let path: string;
  let resolvedMetroId: string | null;
  let resolvedServiceId: string | null;

  if (id) {
    const [existing] = await db.select().from(seoPages).where(eq(seoPages.id, id)).limit(1);
    if (!existing) throw new Error("SEO page not found.");

    pageType = existing.pageType as SeoPageType;
    const target = resolveSeoPageTarget(
      pageType,
      city.slug,
      metro?.slug,
      service?.slug,
    );
    path = target.path;
    resolvedMetroId = target.metroId === undefined ? metroId : target.metroId;
    resolvedServiceId = target.seoServiceId === undefined ? seoServiceId : target.seoServiceId;
  } else {
    pageType = inferSeoPageType(metro?.slug, service?.slug);
    path = buildSeoPath(city.slug, metro?.slug, service?.slug);
    resolvedMetroId = metroId;
    resolvedServiceId = seoServiceId;
  }

  const [conflict] = await db
    .select({ id: seoPages.id, path: seoPages.path })
    .from(seoPages)
    .where(id ? and(eq(seoPages.path, path), ne(seoPages.id, id)) : eq(seoPages.path, path))
    .limit(1);

  if (conflict) {
    throw new Error(
      `Another SEO page already uses /locations/${conflict.path}. Edit that page instead of changing this one into a duplicate.`,
    );
  }

  const template = useTemplate
    ? buildSeoPageContent(
        pageType,
        { name: city.name, state: city.state },
        service,
        metro ? { name: metro.name, state: metro.state } : null,
      )
    : null;

  const metaTitle = String(formData.get("metaTitle") ?? template?.metaTitle ?? "").trim();
  const metaDescription = String(
    formData.get("metaDescription") ?? template?.metaDescription ?? "",
  ).trim();
  const h1 = String(formData.get("h1") ?? template?.h1 ?? "").trim();
  const intro = String(formData.get("intro") ?? template?.intro ?? "").trim();
  const body = String(formData.get("body") ?? template?.body ?? "").trim();
  const heroImage = optionalInternalHero(String(formData.get("heroImage") ?? ""), "Hero image");
  const cardImages = optionalInternalCardImages(
    String(formData.get("cardImages") ?? ""),
    "Card image",
  );

  if (!metaTitle || !metaDescription || !h1 || !intro || !body) {
    throw new Error("All SEO page content fields are required.");
  }

  const values = {
    path,
    pageType,
    cityId,
    metroId: resolvedMetroId,
    seoServiceId: resolvedServiceId,
    metaTitle,
    metaDescription,
    h1,
    intro,
    body,
    heroImage,
    cardImages,
    published,
    noIndex,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(seoPages).set(values).where(eq(seoPages.id, id));
  } else {
    await db.insert(seoPages).values(values);
  }

  // Hub heroes also live on locations — keep Locations admin and resolveHubHeroImage aligned.
  if (pageType === "city_hub") {
    await db.update(locations).set({ heroImage }).where(eq(locations.id, cityId));
  } else if (pageType === "metro_hub" && resolvedMetroId) {
    await db.update(locations).set({ heroImage }).where(eq(locations.id, resolvedMetroId));
  }

  revalidatePath("/dashboard/seo-pages");
  revalidatePath("/dashboard/locations");
  redirect("/dashboard/seo-pages");
}

async function upsertLocationServiceImages(
  cityId: string,
  metroId: string | null,
  seoServiceId: string,
  heroImage: string | null,
  cardImages: string | null,
) {
  const db = getDb();
  const hasImages = Boolean(heroImage || cardImages);

  const existing = await db
    .select({ id: locationServiceImages.id })
    .from(locationServiceImages)
    .where(
      metroId
        ? and(
            eq(locationServiceImages.cityId, cityId),
            eq(locationServiceImages.metroId, metroId),
            eq(locationServiceImages.seoServiceId, seoServiceId),
          )
        : and(
            eq(locationServiceImages.cityId, cityId),
            isNull(locationServiceImages.metroId),
            eq(locationServiceImages.seoServiceId, seoServiceId),
          ),
    )
    .limit(1);

  if (!hasImages) {
    if (existing[0]) {
      await db.delete(locationServiceImages).where(eq(locationServiceImages.id, existing[0].id));
    }
    return;
  }

  if (existing[0]) {
    await db
      .update(locationServiceImages)
      .set({ heroImage, cardImages, updatedAt: new Date() })
      .where(eq(locationServiceImages.id, existing[0].id));
    return;
  }

  await db.insert(locationServiceImages).values({
    cityId,
    metroId,
    seoServiceId,
    heroImage,
    cardImages,
  });
}

async function revalidateLocationPaths(citySlug: string, metroSlug?: string) {
  revalidatePath("/locations");
  revalidatePath(`/locations/${citySlug}`);
  if (metroSlug) {
    revalidatePath(`/locations/${citySlug}/${metroSlug}`);
  }
}

export async function persistCityHubHero(cityId: string, heroImage: string | null) {
  await requireAdminSession();
  const db = getDb();

  const normalized =
    heroImage === null || heroImage.trim() === ""
      ? null
      : assertInternalImageUrl(heroImage, "City hero image");

  const [city] = await db
    .select({ slug: locations.slug })
    .from(locations)
    .where(and(eq(locations.id, cityId), eq(locations.type, "city")))
    .limit(1);

  if (!city) throw new Error("City not found.");

  await db.update(locations).set({ heroImage: normalized }).where(eq(locations.id, cityId));

  // Keep hub SEO page in sync — live site prefers seo_pages.hero_image when set.
  await db
    .update(seoPages)
    .set({ heroImage: normalized, updatedAt: new Date() })
    .where(
      and(
        eq(seoPages.cityId, cityId),
        isNull(seoPages.metroId),
        eq(seoPages.pageType, "city_hub"),
      ),
    );

  revalidatePath("/dashboard/locations");
  revalidatePath(`/dashboard/locations/${cityId}`);
  await revalidateLocationPaths(city.slug);

  return { ok: true as const, heroImage: normalized };
}

export async function persistMetroHubHero(
  cityId: string,
  metroId: string,
  heroImage: string | null,
) {
  await requireAdminSession();
  const db = getDb();

  const normalized =
    heroImage === null || heroImage.trim() === ""
      ? null
      : assertInternalImageUrl(heroImage, "Metro hero image");

  const [metro] = await db
    .select({ slug: locations.slug, parentId: locations.parentId })
    .from(locations)
    .where(and(eq(locations.id, metroId), eq(locations.type, "metro")))
    .limit(1);

  if (!metro || metro.parentId !== cityId) throw new Error("Metro not found.");

  const [city] = await db
    .select({ slug: locations.slug })
    .from(locations)
    .where(eq(locations.id, cityId))
    .limit(1);

  if (!city) throw new Error("City not found.");

  await db.update(locations).set({ heroImage: normalized }).where(eq(locations.id, metroId));

  // Keep metro hub SEO page in sync — live site prefers seo_pages.hero_image when set.
  await db
    .update(seoPages)
    .set({ heroImage: normalized, updatedAt: new Date() })
    .where(
      and(
        eq(seoPages.cityId, cityId),
        eq(seoPages.metroId, metroId),
        eq(seoPages.pageType, "metro_hub"),
      ),
    );

  revalidatePath(`/dashboard/locations/${cityId}`);
  revalidatePath(`/dashboard/locations/${cityId}/metros/${metroId}`);
  await revalidateLocationPaths(city.slug, metro.slug);

  return { ok: true as const, heroImage: normalized };
}

export async function saveCityHubHero(formData: FormData) {
  await requireAdminSession();

  const cityId = String(formData.get("cityId") ?? "").trim();
  if (!cityId) throw new Error("City is required.");

  const cityHeroImage = optionalInternalHero(
    String(formData.get("cityHeroImage") ?? ""),
    "City hero image",
  );
  await persistCityHubHero(cityId, cityHeroImage);
  redirect(`/dashboard/locations/${cityId}`);
}

export async function saveCityServiceImages(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const cityId = String(formData.get("cityId") ?? "").trim();
  const serviceId = String(formData.get("serviceId") ?? "").trim();
  if (!cityId || !serviceId) throw new Error("City and service are required.");

  const heroImage = optionalInternalHero(
    String(formData.get("serviceHero") ?? ""),
    "Service hero image",
  );
  const cardImages = optionalInternalCardImages(
    String(formData.get("serviceCards") ?? ""),
    "Service card image",
  );
  await upsertLocationServiceImages(cityId, null, serviceId, heroImage, cardImages);

  revalidatePath(`/dashboard/locations/${cityId}`);
  redirect(`/dashboard/locations/${cityId}`);
}

export async function saveMetroHubHero(formData: FormData) {
  await requireAdminSession();

  const cityId = String(formData.get("cityId") ?? "").trim();
  const metroId = String(formData.get("metroId") ?? "").trim();
  if (!cityId || !metroId) throw new Error("City and metro are required.");

  const metroHeroImage = optionalInternalHero(
    String(formData.get("metroHeroImage") ?? ""),
    "Metro hero image",
  );
  await persistMetroHubHero(cityId, metroId, metroHeroImage);

  const returnPath = String(formData.get("returnPath") ?? "").trim();
  redirect(returnPath || `/dashboard/locations/${cityId}`);
}

export async function saveMetroServiceImages(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const cityId = String(formData.get("cityId") ?? "").trim();
  const metroId = String(formData.get("metroId") ?? "").trim();
  const serviceId = String(formData.get("serviceId") ?? "").trim();
  if (!cityId || !metroId || !serviceId) {
    throw new Error("City, metro, and service are required.");
  }

  const heroImage = optionalInternalHero(
    String(formData.get("serviceHero") ?? ""),
    "Service hero image",
  );
  const cardImages = optionalInternalCardImages(
    String(formData.get("serviceCards") ?? ""),
    "Service card image",
  );
  await upsertLocationServiceImages(cityId, metroId, serviceId, heroImage, cardImages);

  revalidatePath(`/dashboard/locations/${cityId}`);
  revalidatePath(`/dashboard/locations/${cityId}/metros/${metroId}`);
  redirect(`/dashboard/locations/${cityId}/metros/${metroId}`);
}

export async function saveLocationImages(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const cityId = String(formData.get("cityId") ?? "").trim();
  if (!cityId) throw new Error("City is required.");

  const [city] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, cityId), eq(locations.type, "city")))
    .limit(1);

  if (!city) throw new Error("City not found.");

  const cityHeroImage = optionalInternalHero(
    String(formData.get("cityHeroImage") ?? ""),
    "City hero image",
  );
  await db.update(locations).set({ heroImage: cityHeroImage }).where(eq(locations.id, cityId));

  const metros = await db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.parentId, cityId), eq(locations.type, "metro")));

  for (const metro of metros) {
    const metroHeroImage = optionalInternalHero(
      String(formData.get(`metroHero_${metro.id}`) ?? ""),
      "Metro hero image",
    );
    await db
      .update(locations)
      .set({ heroImage: metroHeroImage })
      .where(eq(locations.id, metro.id));
  }

  const services = await db.select({ id: seoServices.id }).from(seoServices);

  for (const service of services) {
    const heroImage = optionalInternalHero(
      String(formData.get(`serviceHero_${service.id}`) ?? ""),
      "Service hero image",
    );
    const cardImages = optionalInternalCardImages(
      String(formData.get(`serviceCards_${service.id}`) ?? ""),
      "Service card image",
    );
    await upsertLocationServiceImages(cityId, null, service.id, heroImage, cardImages);
  }

  revalidatePath("/dashboard/locations");
  revalidatePath(`/dashboard/locations/${cityId}`);
  redirect(`/dashboard/locations/${cityId}`);
}

export async function saveMetroLocationImages(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const cityId = String(formData.get("cityId") ?? "").trim();
  const metroId = String(formData.get("metroId") ?? "").trim();
  if (!cityId || !metroId) throw new Error("City and metro are required.");

  const [metro] = await db
    .select()
    .from(locations)
    .where(
      and(
        eq(locations.id, metroId),
        eq(locations.type, "metro"),
        eq(locations.parentId, cityId),
      ),
    )
    .limit(1);

  if (!metro) throw new Error("Metro not found.");

  const metroHeroImage = optionalInternalHero(
    String(formData.get("metroHeroImage") ?? ""),
    "Metro hero image",
  );
  await db.update(locations).set({ heroImage: metroHeroImage }).where(eq(locations.id, metroId));

  const services = await db.select({ id: seoServices.id }).from(seoServices);

  for (const service of services) {
    const heroImage = optionalInternalHero(
      String(formData.get(`serviceHero_${service.id}`) ?? ""),
      "Service hero image",
    );
    const cardImages = optionalInternalCardImages(
      String(formData.get(`serviceCards_${service.id}`) ?? ""),
      "Service card image",
    );
    await upsertLocationServiceImages(cityId, metroId, service.id, heroImage, cardImages);
  }

  revalidatePath(`/dashboard/locations/${cityId}`);
  revalidatePath(`/dashboard/locations/${cityId}/metros/${metroId}`);
  redirect(`/dashboard/locations/${cityId}/metros/${metroId}`);
}

export async function saveHomepagePage(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Page id is required.");

  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  if (!page || page.pageType !== "homepage" || page.slug !== HOME_PAGE_SLUG) {
    throw new Error("Homepage record not found.");
  }

  const heroMainImage =
    optionalInternalHero(String(formData.get("heroMainImage") ?? ""), "Main hero image") ??
    parseHomepageSettings(null).heroMainImage;
  const heroAccentImage =
    optionalInternalHero(String(formData.get("heroAccentImage") ?? ""), "Accent hero image") ??
    parseHomepageSettings(null).heroAccentImage;

  const settings: HomepageSettings = {
    heroMainImage,
    heroAccentImage,
    heroKicker: String(formData.get("heroKicker") ?? "").trim(),
    heroTitleLine1: String(formData.get("heroTitleLine1") ?? "").trim(),
    heroTitleLine2: String(formData.get("heroTitleLine2") ?? "").trim(),
    heroSubtitle: String(formData.get("heroSubtitle") ?? "").trim(),
    statNumber: String(formData.get("statNumber") ?? "").trim(),
    statLabel: String(formData.get("statLabel") ?? "").trim(),
  };

  if (
    !settings.heroKicker ||
    !settings.heroTitleLine1 ||
    !settings.heroTitleLine2 ||
    !settings.heroSubtitle ||
    !settings.statNumber ||
    !settings.statLabel
  ) {
    throw new Error("All homepage text fields are required.");
  }

  const published = formData.get("published") === "on";

  await db
    .update(sitePages)
    .set({
      settings: JSON.stringify(settings),
      published,
      updatedAt: new Date(),
    })
    .where(eq(sitePages.id, id));

  revalidatePath("/dashboard/pages");
  redirect(`/dashboard/pages/${id}`);
}

export async function saveClientFeedback(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  let parsed: unknown = [];
  try {
    parsed = JSON.parse(String(formData.get("feedbackJson") ?? "[]"));
  } catch {
    throw new Error("Invalid feedback payload.");
  }

  const items = normalizeClientFeedback(parsed);

  const [existing] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, CLIENT_FEEDBACK_SETTINGS_KEY))
    .limit(1);

  const value = JSON.stringify(items);
  const updatedAt = new Date();

  if (existing) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt })
      .where(eq(siteSettings.key, CLIENT_FEEDBACK_SETTINGS_KEY));
  } else {
    await db.insert(siteSettings).values({
      key: CLIENT_FEEDBACK_SETTINGS_KEY,
      value,
      updatedAt,
    });
  }

  revalidatePath("/dashboard/feedback");
  revalidatePath("/");
  redirect("/dashboard/feedback?saved=1");
}

export async function saveService360Page(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Page id is required.");

  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  if (!page || page.pageType !== "service360" || page.slug !== SERVICE360_PAGE_SLUG) {
    throw new Error("Service360 page record not found.");
  }

  const heroImage =
    optionalInternalHero(String(formData.get("heroImage") ?? ""), "Hero image") ??
    parseService360Settings(null).heroImage;

  const settings: Service360Settings = {
    heroImage,
    heroKicker: String(formData.get("heroKicker") ?? "").trim(),
    heroTitleLine1: String(formData.get("heroTitleLine1") ?? "").trim(),
    heroTitleLine2: String(formData.get("heroTitleLine2") ?? "").trim(),
    heroSummary: String(formData.get("heroSummary") ?? "").trim(),
    badgeNumber: String(formData.get("badgeNumber") ?? "").trim(),
    badgeLabel: String(formData.get("badgeLabel") ?? "").trim(),
  };

  if (
    !settings.heroKicker ||
    !settings.heroTitleLine1 ||
    !settings.heroTitleLine2 ||
    !settings.heroSummary ||
    !settings.badgeNumber ||
    !settings.badgeLabel
  ) {
    throw new Error("All Service360 text fields are required.");
  }

  const published = formData.get("published") === "on";

  await db
    .update(sitePages)
    .set({
      settings: JSON.stringify(settings),
      published,
      updatedAt: new Date(),
    })
    .where(eq(sitePages.id, id));

  revalidatePath("/dashboard/pages");
  redirect(`/dashboard/pages/${id}`);
}

export async function saveNewsPage(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Page id is required.");

  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  if (!page || page.pageType !== "news" || page.slug !== NEWS_PAGE_SLUG) {
    throw new Error("News page record not found.");
  }

  const heroImage =
    optionalInternalHero(String(formData.get("heroImage") ?? ""), "Hero image") ??
    parseNewsSettings(null).heroImage;

  const settings: NewsPageSettings = {
    heroImage,
    heroKicker: String(formData.get("heroKicker") ?? "").trim(),
    heroTitleLine1: String(formData.get("heroTitleLine1") ?? "").trim(),
    heroTitleLine2: String(formData.get("heroTitleLine2") ?? "").trim(),
    heroSummary: String(formData.get("heroSummary") ?? "").trim(),
    heroImageAlt: String(formData.get("heroImageAlt") ?? "").trim(),
    emptyBadgeNumber: String(formData.get("emptyBadgeNumber") ?? "").trim(),
    emptyBadgeLabel: String(formData.get("emptyBadgeLabel") ?? "").trim(),
  };

  if (
    !settings.heroKicker ||
    !settings.heroTitleLine1 ||
    !settings.heroTitleLine2 ||
    !settings.heroSummary ||
    !settings.heroImageAlt ||
    !settings.emptyBadgeNumber ||
    !settings.emptyBadgeLabel
  ) {
    throw new Error("All News page text fields are required.");
  }

  const published = formData.get("published") === "on";

  await db
    .update(sitePages)
    .set({
      title: "News",
      settings: JSON.stringify(settings),
      published,
      updatedAt: new Date(),
    })
    .where(eq(sitePages.id, id));

  revalidatePath("/dashboard/pages");
  revalidatePath("/news");
  redirect(`/dashboard/pages/${id}`);
}

export async function saveAboutPage(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Page id is required.");

  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  if (!page || page.pageType !== "about" || page.slug !== ABOUT_PAGE_SLUG) {
    throw new Error("About page record not found.");
  }

  const heroImage =
    optionalInternalHero(String(formData.get("heroImage") ?? ""), "Hero image") ??
    parseAboutSettings(null).heroImage;

  const settings: AboutPageSettings = {
    heroImage,
    heroImageAlt: String(formData.get("heroImageAlt") ?? "").trim(),
  };

  if (!settings.heroImageAlt) {
    throw new Error("Hero image alt text is required.");
  }

  const published = formData.get("published") === "on";

  await db
    .update(sitePages)
    .set({
      title: "About Us",
      settings: JSON.stringify(settings),
      published,
      updatedAt: new Date(),
    })
    .where(eq(sitePages.id, id));

  revalidatePath("/dashboard/pages");
  revalidatePath("/about");
  redirect(`/dashboard/pages/${id}`);
}

export async function saveTemplateSitePage(formData: FormData) {
  await requireAdminSession();
  const db = getDb();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const published = formData.get("published") === "on";

  if (!id || !title) {
    throw new Error("Title is required.");
  }

  const [page] = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
  if (!page || page.pageType !== "template") {
    throw new Error("Template page not found.");
  }

  await db
    .update(sitePages)
    .set({
      title,
      published,
      updatedAt: new Date(),
    })
    .where(eq(sitePages.id, id));

  revalidatePath("/dashboard/pages");
  redirect(`/dashboard/pages/${id}`);
}