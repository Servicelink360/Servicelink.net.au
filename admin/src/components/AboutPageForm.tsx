import { ImageUploadField } from "@/components/ImageUploadField";
import { saveAboutPage } from "@/lib/actions";
import type { SitePage } from "@/lib/db/schema";
import { parseAboutSettings } from "@/lib/about-page";
import { IMAGE_SPECS } from "@/lib/image-specs";
import { getSystemSitePagePublicPath } from "@/lib/site-pages";

type AboutPageFormProps = {
  page: SitePage;
};

export function AboutPageForm({ page }: AboutPageFormProps) {
  const settings = parseAboutSettings(page.settings);
  const publicPath = getSystemSitePagePublicPath(page.slug) ?? "/about";

  return (
    <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveAboutPage}>
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
          template. Edit the hero image here.
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Hero</h2>
        <div className="admin-field">
          <ImageUploadField
            name="heroImage"
            label="Hero image"
            defaultValue={settings.heroImage}
            uploadScope="site"
            preferredName="about-hero"
            recommendedSize={IMAGE_SPECS.aboutPageHero}
            helpText="Shown on the About Us page beside the intro copy."
          />
        </div>
        <div className="admin-field">
          <label htmlFor="heroImageAlt">Hero image alt text</label>
          <input
            id="heroImageAlt"
            name="heroImageAlt"
            defaultValue={settings.heroImageAlt}
            required
          />
        </div>
      </section>

      <label>
        <input type="checkbox" name="published" defaultChecked={page.published} /> Published
      </label>

      <div style={{ marginTop: "1.25rem" }}>
        <button className="admin-btn" type="submit">
          Save About page
        </button>
      </div>
    </form>
  );
}
