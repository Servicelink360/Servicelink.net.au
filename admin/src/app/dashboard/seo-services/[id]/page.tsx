import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { seoServices } from "@/lib/db/schema";
import { saveSeoService } from "@/lib/actions";
import { CardImagesField } from "@/components/CardImagesField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { cardImagesToTextarea } from "@/lib/location-images";
import { IMAGE_SPECS } from "@/lib/image-specs";

type EditSeoServicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSeoServicePage({ params }: EditSeoServicePageProps) {
  const { id } = await params;
  const [service] = await getDb()
    .select()
    .from(seoServices)
    .where(eq(seoServices.id, id))
    .limit(1);

  if (!service) notFound();

  const imageScope = `services/${service.linkedServiceSlug || service.slug}`;

  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>Edit SEO service</h1>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/seo-services">
          Back
        </Link>
      </div>
      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveSeoService}>
        <input type="hidden" name="id" value={service.id} />
        <div className="admin-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={service.name} required />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={service.slug} required />
        </div>
        <div className="admin-field">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" rows={3} defaultValue={service.summary} required />
        </div>
        <div className="admin-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={5} defaultValue={service.description} required />
        </div>
        <div className="admin-field">
          <label htmlFor="linkedServiceSlug">Linked static service slug</label>
          <input
            id="linkedServiceSlug"
            name="linkedServiceSlug"
            defaultValue={service.linkedServiceSlug ?? ""}
          />
        </div>
        <div className="admin-field">
          <ImageUploadField
            name="heroImage"
            label="Default hero image"
            defaultValue={service.heroImage}
            uploadScope={imageScope}
            preferredName="hero"
            recommendedSize={IMAGE_SPECS.serviceHero}
            helpText="Shown on location pages when no local override exists."
          />
        </div>
        <div className="admin-field">
          <CardImagesField
            name="cardImages"
            label="Default card images"
            defaultValue={cardImagesToTextarea(service.cardImages)}
            uploadScope={imageScope}
            recommendedSize={IMAGE_SPECS.serviceCard}
            helpText="Upload up to 3 card images. Each slot is shown on location service cards."
          />
        </div>
        <div className="admin-field">
          <label htmlFor="sortOrder">Sort order</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={service.sortOrder} />
        </div>
        <label>
          <input type="checkbox" name="published" defaultChecked={service.published} /> Published
        </label>
        <button className="admin-btn" type="submit">
          Save changes
        </button>
      </form>
    </>
  );
}
