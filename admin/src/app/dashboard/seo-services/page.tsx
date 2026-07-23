import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { seoServices } from "@/lib/db/schema";
import { deleteSeoService } from "@/lib/actions";
import { SeoServicesTable } from "./SeoServicesTable";

export default async function SeoServicesPage() {
  const rows = await getDb()
    .select({
      id: seoServices.id,
      name: seoServices.name,
      slug: seoServices.slug,
      linkedServiceSlug: seoServices.linkedServiceSlug,
      published: seoServices.published,
      sortOrder: seoServices.sortOrder,
    })
    .from(seoServices)
    .orderBy(asc(seoServices.sortOrder), asc(seoServices.name));

  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>SEO Services</h1>
        <Link className="admin-btn" href="/dashboard/seo-services/new">
          Add SEO service
        </Link>
      </div>

      <div className="admin-panel" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
        <p style={{ margin: "0 0 0.75rem", color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
          SEO services are <strong>service templates only</strong> — they do not have a location field.
          Cities and metros are synced from{" "}
          <code>web/scripts/data/australia-locations.mjs</code> via{" "}
          <code>npm run db:seed-locations</code>.
        </p>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
          To create location + service pages, go to{" "}
          <Link href="/dashboard/seo-pages">SEO Pages</Link>. That combines a city/metro with a service
          into a live URL, e.g.{" "}
          <code>/locations/sydney/cleaning</code> or{" "}
          <code>/locations/melbourne/richmond/facilities-management</code>. Run{" "}
          <code>npm run db:generate-seo-pages</code> in the web project to auto-create all combinations.
        </p>
      </div>
      <div className="admin-panel">
        <SeoServicesTable rows={rows} deleteSeoService={deleteSeoService} />
      </div>
    </>
  );
}
