import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { locations, seoPages, seoServices } from "@/lib/db/schema";
import type { SeoPageType } from "@/lib/seo-templates";
import { cardImagesToTextarea } from "@/lib/location-images";
import { SeoPageForm } from "../SeoPageForm";

type EditSeoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSeoPage({ params }: EditSeoPageProps) {
  const { id } = await params;
  const db = getDb();
  const [page] = await db.select().from(seoPages).where(eq(seoPages.id, id)).limit(1);

  if (!page) notFound();

  const [cities, metros, services] = await Promise.all([
    db
      .select({ id: locations.id, name: locations.name, state: locations.state })
      .from(locations)
      .where(and(eq(locations.type, "city"), isNull(locations.parentId)))
      .orderBy(asc(locations.state), asc(locations.name)),
    db
      .select({ id: locations.id, name: locations.name, parentId: locations.parentId })
      .from(locations)
      .where(eq(locations.type, "metro"))
      .orderBy(asc(locations.sortOrder), asc(locations.name)),
    db
      .select({ id: seoServices.id, name: seoServices.name })
      .from(seoServices)
      .orderBy(asc(seoServices.sortOrder), asc(seoServices.name)),
  ]);

  return (
    <SeoPageForm
      cities={cities}
      metros={metros}
      services={services}
      mode="edit"
      pageId={page.id}
      defaultCityId={page.cityId}
      defaultMetroId={page.metroId ?? ""}
      defaultServiceId={page.seoServiceId ?? ""}
      defaultMetaTitle={page.metaTitle}
      defaultMetaDescription={page.metaDescription}
      defaultH1={page.h1}
      defaultIntro={page.intro}
      defaultBody={page.body}
      defaultHeroImage={page.heroImage ?? ""}
      defaultCardImages={cardImagesToTextarea(page.cardImages)}
      defaultPublished={page.published}
      defaultNoIndex={page.noIndex}
      defaultPageType={page.pageType as SeoPageType}
      publicPath={page.path}
    />
  );
}
