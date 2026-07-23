import { saveHomepagePage } from "@/lib/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { parseHomepageSettings } from "@/lib/homepage";
import type { SitePage } from "@/lib/db/schema";
import { getSystemSitePagePublicPath } from "@/lib/site-pages";
import { IMAGE_SPECS } from "@/lib/image-specs";

type HomepagePageFormProps = {
  page: SitePage;
};

export function HomepagePageForm({ page }: HomepagePageFormProps) {
  const settings = parseHomepageSettings(page.settings);
  const publicPath = getSystemSitePagePublicPath(page.slug) ?? "/";

  return (
    <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveHomepagePage}>
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
          Public URL: <strong>{publicPath}</strong> · This is the main homepage template.
          Client feedback is managed separately under{" "}
          <a href="/dashboard/feedback">Client feedback</a>.
        </p>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Hero images</h2>
        <div className="admin-field">
          <ImageUploadField
            name="heroMainImage"
            label="Main hero image"
            defaultValue={settings.heroMainImage}
            uploadScope="site"
            preferredName="hero-main"
            recommendedSize={IMAGE_SPECS.homepageHeroMain}
          />
        </div>
        <div className="admin-field">
          <ImageUploadField
            name="heroAccentImage"
            label="Accent hero image"
            defaultValue={settings.heroAccentImage}
            uploadScope="site"
            preferredName="hero-accent"
            recommendedSize={IMAGE_SPECS.homepageHeroAccent}
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
          <label htmlFor="heroSubtitle">Subtitle</label>
          <textarea
            id="heroSubtitle"
            name="heroSubtitle"
            rows={4}
            defaultValue={settings.heroSubtitle}
            required
          />
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Hero stat card</h2>
        <p style={{ marginTop: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
          Number is overridden by live Service360 site count when available. Label always comes
          from here.
        </p>
        <div className="admin-field">
          <label htmlFor="statNumber">Stat number (fallback)</label>
          <input id="statNumber" name="statNumber" defaultValue={settings.statNumber} required />
        </div>
        <div className="admin-field">
          <label htmlFor="statLabel">Stat label</label>
          <input id="statLabel" name="statLabel" defaultValue={settings.statLabel} required />
        </div>
      </section>

      <label>
        <input type="checkbox" name="published" defaultChecked={page.published} /> Published
      </label>

      <div style={{ marginTop: "1.25rem" }}>
        <button className="admin-btn" type="submit">
          Save homepage
        </button>
      </div>
    </form>
  );
}
