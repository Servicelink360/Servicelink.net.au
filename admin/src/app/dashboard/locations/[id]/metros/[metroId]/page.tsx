import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { saveMetroServiceImages } from "@/lib/actions";
import { CardImagesField } from "@/components/CardImagesField";
import { MetroHubHeroField } from "@/components/CityHubHeroField";
import { ImageSectionForm } from "@/components/ImageSectionForm";
import { ImageUploadField } from "@/components/ImageUploadField";
import { getDb } from "@/lib/db";
import { locationServiceImages, locations, seoServices } from "@/lib/db/schema";
import { cardImagesToTextarea } from "@/lib/location-images";
import { IMAGE_SPECS } from "@/lib/image-specs";

type EditMetroImagesPageProps = {
  params: Promise<{ id: string; metroId: string }>;
};

export default async function EditMetroImagesPage({ params }: EditMetroImagesPageProps) {
  const { id: cityId, metroId } = await params;
  const db = getDb();

  const [city] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, cityId), eq(locations.type, "city")))
    .limit(1);

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

  if (!city || !metro) notFound();

  const [services, metroServiceImages] = await Promise.all([
    db
      .select({
        id: seoServices.id,
        name: seoServices.name,
        slug: seoServices.slug,
        linkedServiceSlug: seoServices.linkedServiceSlug,
      })
      .from(seoServices)
      .orderBy(asc(seoServices.sortOrder), asc(seoServices.name)),
    db
      .select()
      .from(locationServiceImages)
      .where(
        and(
          eq(locationServiceImages.cityId, cityId),
          eq(locationServiceImages.metroId, metroId),
        ),
      ),
  ]);

  const metroServiceMap = new Map(
    metroServiceImages.map((row) => [row.seoServiceId, row]),
  );

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>
            {metro.name}, {city.name}
          </h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Metro-specific overrides. Each section has its own Save button.
          </p>
        </div>
        <Link className="admin-btn admin-btn--ghost" href={`/dashboard/locations/${cityId}`}>
          Back to {city.name}
        </Link>
      </div>

      <div className="admin-form" style={{ display: "grid", gap: "1.5rem" }}>
        <section className="admin-panel admin-image-section">
          <h2 style={{ marginTop: 0 }}>Metro hub hero</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Upload or remove — saves to the live site immediately.
          </p>
          <MetroHubHeroField
            cityId={cityId}
            citySlug={city.slug}
            metroId={metroId}
            metroSlug={metro.slug}
            defaultValue={metro.heroImage}
            fallbackLabel="Currently on the live site (metro, city, or default image)"
          />
        </section>

        <section className="admin-panel admin-image-section">
          <h2 style={{ marginTop: 0 }}>Metro service images</h2>
          {services.map((service) => {
            const override = metroServiceMap.get(service.id);
            const serviceScope = `locations/${city.slug}/metros/${metro.slug}/services/${service.linkedServiceSlug || service.slug}`;
            return (
              <div key={service.id} className="admin-image-section__block">
                <h3 style={{ marginTop: 0 }}>{service.name}</h3>
                <ImageSectionForm
                  action={saveMetroServiceImages}
                  saveLabel={`Save ${service.name}`}
                >
                  <input type="hidden" name="cityId" value={cityId} />
                  <input type="hidden" name="metroId" value={metroId} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <div className="admin-field">
                    <ImageUploadField
                      name="serviceHero"
                      label="Hero image"
                      defaultValue={override?.heroImage}
                      uploadScope={serviceScope}
                      preferredName="hero"
                      recommendedSize={IMAGE_SPECS.serviceHero}
                      saveHint={`Image ready — click Save ${service.name} to publish.`}
                    />
                  </div>
                  <div className="admin-field">
                    <CardImagesField
                      name="serviceCards"
                      label="Card images"
                      defaultValue={cardImagesToTextarea(override?.cardImages)}
                      uploadScope={serviceScope}
                      recommendedSize={IMAGE_SPECS.serviceCard}
                    />
                  </div>
                </ImageSectionForm>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
