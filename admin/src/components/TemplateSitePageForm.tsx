import { saveTemplateSitePage } from "@/lib/actions";
import type { SitePage } from "@/lib/db/schema";
import { getSystemSitePagePublicPath } from "@/lib/site-pages";

type TemplateSitePageFormProps = {
  page: SitePage;
};

export function TemplateSitePageForm({ page }: TemplateSitePageFormProps) {
  const publicPath = getSystemSitePagePublicPath(page.slug) ?? `/${page.slug}`;

  return (
    <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveTemplateSitePage}>
      <input type="hidden" name="id" value={page.id} />

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
          Public URL: <strong>{publicPath}</strong> · Layout and sections are rendered by the site
          template. Use this record to manage the page title and published status in admin.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="title">Admin title</label>
        <input id="title" name="title" defaultValue={page.title} required />
      </div>

      <div className="admin-field">
        <label htmlFor="slug">Slug</label>
        <input id="slug" name="slug" value={page.slug} readOnly disabled />
      </div>

      <label>
        <input type="checkbox" name="published" defaultChecked={page.published} /> Published
      </label>

      <div style={{ marginTop: "1.25rem" }}>
        <button className="admin-btn" type="submit">
          Save page
        </button>
      </div>
    </form>
  );
}
