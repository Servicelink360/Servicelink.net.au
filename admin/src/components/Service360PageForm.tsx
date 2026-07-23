import { saveService360Page } from "@/lib/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { parseService360Settings } from "@/lib/service360";
import type { SitePage } from "@/lib/db/schema";
import { getSystemSitePagePublicPath } from "@/lib/site-pages";
import { IMAGE_SPECS } from "@/lib/image-specs";

type Service360PageFormProps = {
  page: SitePage;
};

export function Service360PageForm({ page }: Service360PageFormProps) {
  const settings = parseService360Settings(page.settings);
  const publicPath = getSystemSitePagePublicPath(page.slug) ?? "/service360";

  return (
    <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveService360Page}>
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
          Public URL: <strong>{publicPath}</strong> · Hero content for the Service360 platform page.
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Hero image</h2>
        <div className="admin-field">
          <ImageUploadField
            name="heroImage"
            label="Hero image"
            defaultValue={settings.heroImage}
            uploadScope="site"
            preferredName="service360-hero"
            recommendedSize={IMAGE_SPECS.service360Hero}
          />
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Hero copy</h2>
        <div className="admin-field">
          <label htmlFor="heroKicker">Kicker</label>
          <input id="heroKicker" name="heroKicker" defaultValue={settings.heroKicker} required />
        </div>
        <div className="admin-field">
          <label htmlFor="heroTitleLine1">Headline line 1</label>
          <input
            id="heroTitleLine1"
            name="heroTitleLine1"
            defaultValue={settings.heroTitleLine1}
            required
          />
        </div>
        <div className="admin-field">
          <label htmlFor="heroTitleLine2">Headline line 2 (emphasis)</label>
          <input
            id="heroTitleLine2"
            name="heroTitleLine2"
            defaultValue={settings.heroTitleLine2}
            required
          />
        </div>
        <div className="admin-field">
          <label htmlFor="heroSummary">Summary</label>
          <textarea
            id="heroSummary"
            name="heroSummary"
            rows={4}
            defaultValue={settings.heroSummary}
            required
          />
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Hero badge</h2>
        <div className="admin-field">
          <label htmlFor="badgeNumber">Badge number</label>
          <input id="badgeNumber" name="badgeNumber" defaultValue={settings.badgeNumber} required />
        </div>
        <div className="admin-field">
          <label htmlFor="badgeLabel">Badge label</label>
          <input id="badgeLabel" name="badgeLabel" defaultValue={settings.badgeLabel} required />
        </div>
      </section>

      <label>
        <input type="checkbox" name="published" defaultChecked={page.published} /> Published
      </label>

      <div style={{ marginTop: "1.25rem" }}>
        <button className="admin-btn" type="submit">
          Save Service360 page
        </button>
      </div>
    </form>
  );
}
