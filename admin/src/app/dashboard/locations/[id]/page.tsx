import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { saveCityServiceImages } from "@/lib/actions";
import { CardImagesField } from "@/components/CardImagesField";
import { CityHubHeroField, MetroHubHeroField } from "@/components/CityHubHeroField";
import { ImageSectionForm } from "@/components/ImageSectionForm";
import { ImageUploadField } from "@/components/ImageUploadField";
import { getDb } from "@/lib/db";
import { locationServiceImages, locations, seoServices } from "@/lib/db/schema";
import { cardImagesToTextarea } from "@/lib/location-images";
import { IMAGE_SPECS } from "@/lib/image-specs";

type EditLocationImagesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLocationImagesPage({ params }: EditLocationImagesPageProps) {
  const { id } = await params;
  const db = getDb();

  const [city] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, id), eq(locations.type, "city")))
    .limit(1);

  if (!city) notFound();

  const [metros, services, cityServiceImages] = await Promise.all([
    db
      .select({
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
        heroImage: locations.heroImage,
      })
      .from(locations)
      .where(and(eq(locations.parentId, id), eq(locations.type, "metro")))
      .orderBy(asc(locations.name)),
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
      .where(and(eq(locationServiceImages.cityId, id), isNull(locationServiceImages.metroId))),
  ]);

  const cityServiceMap = new Map(
    cityServiceImages.map((row) => [row.seoServiceId, row]),
  );

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>
            {city.name}, {city.state}
          </h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            City-wide images apply to all metros unless a metro has its own override. Each section
            has its own Save button.
          </p>
        </div>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/locations">
          Back
        </Link>
      </div>

      <div className="admin-form" style={{ display: "grid", gap: "1.5rem" }}>
        <section className="admin-panel admin-image-section">
          <h2 style={{ marginTop: 0 }}>City hub hero</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Used on <code>/locations/{city.slug}</code>. Upload or remove — saves to the live site
            immediately.
          </p>
          <CityHubHeroField
            cityId={city.id}
            citySlug={city.slug}
            defaultValue={city.heroImage}
          />
        </section>

        <section className="admin-panel admin-image-section">
          <h2 style={{ marginTop: 0 }}>City-wide service images</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Applies to all service pages in {city.name} and its metros.
          </p>
          {services.map((service) => {
            const override = cityServiceMap.get(service.id);
            const serviceScope = `locations/${city.slug}/services/${service.linkedServiceSlug || service.slug}`;
            return (
              <div key={service.id} className="admin-image-section__block">
                <h3 style={{ marginTop: 0 }}>{service.name}</h3>
                <ImageSectionForm
                  action={saveCityServiceImages}
                  saveLabel={`Save ${service.name}`}
                >
                  <input type="hidden" name="cityId" value={city.id} />
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

        {metros.length > 0 ? (
          <section className="admin-panel admin-image-section">
            <h2 style={{ marginTop: 0 }}>Metro hub heroes</h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Optional per-metro hub hero. If a metro has no image of its own, the live site uses
              the city hub hero. Service overrides are managed per metro.
            </p>
            {metros.map((metro) => (
              <div key={metro.id} className="admin-image-section__block">
                <MetroHubHeroField
                  cityId={city.id}
                  citySlug={city.slug}
                  metroId={metro.id}
                  metroSlug={metro.slug}
                  defaultValue={metro.heroImage}
                  cityHeroImage={city.heroImage}
                  label={`${metro.name} hero image`}
                />
                <p style={{ margin: "0.75rem 0 0", fontSize: "0.8125rem" }}>
                  <Link href={`/dashboard/locations/${city.id}/metros/${metro.id}`}>
                    Manage {metro.name} service images →
                  </Link>
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </>
  );
}
