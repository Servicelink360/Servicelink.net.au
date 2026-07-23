import Link from "next/link";
import { saveSeoService } from "@/lib/actions";
import { NewSeoServiceImageFields } from "@/components/NewSeoServiceImageFields";

export default function NewSeoServicePage() {
  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>Add SEO service</h1>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/seo-services">
          Back
        </Link>
      </div>
      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveSeoService}>
        <div
          className="admin-panel"
          style={{
            padding: "1rem",
            marginBottom: "1.25rem",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
            This form defines a <strong>service type</strong> (e.g. cleaning), not a location page.
            Location is set when you create an{" "}
            <Link href="/dashboard/seo-pages">SEO Page</Link> or run the page generator. Core services
            (facilities-management, cleaning, ground-maintenance, tree-services, maintenance,
            asset-management, support-services, roof-gutter-solar-cleaning) are already seeded — you usually only need to edit copy here, not add
            duplicates.
          </p>
        </div>
        <div className="admin-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required placeholder="General Cleaning" />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" required placeholder="cleaning" />
        </div>
        <div className="admin-field">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" rows={3} required />
        </div>
        <div className="admin-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={5} required />
        </div>
        <NewSeoServiceImageFields />
        <div className="admin-field">
          <label htmlFor="sortOrder">Sort order</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={0} />
        </div>
        <label>
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        <button className="admin-btn" type="submit">
          Save SEO service
        </button>
      </form>
    </>
  );
}
