import Link from "next/link";
import { desc } from "drizzle-orm";
import { ImageUploadField } from "@/components/ImageUploadField";
import { saveNewsPage } from "@/lib/actions";
import { getDb } from "@/lib/db";
import type { SitePage } from "@/lib/db/schema";
import { newsPosts } from "@/lib/db/schema";
import { IMAGE_SPECS } from "@/lib/image-specs";
import { parseNewsSettings } from "@/lib/news-page";
import { getSystemSitePagePublicPath } from "@/lib/site-pages";

type NewsPageFormProps = {
  page: SitePage;
};

export async function NewsPageForm({ page }: NewsPageFormProps) {
  const settings = parseNewsSettings(page.settings);
  const publicPath = getSystemSitePagePublicPath(page.slug) ?? "/news";
  const posts = await getDb()
    .select({
      id: newsPosts.id,
      title: newsPosts.title,
      slug: newsPosts.slug,
      published: newsPosts.published,
      publishedAt: newsPosts.publishedAt,
    })
    .from(newsPosts)
    .orderBy(desc(newsPosts.createdAt));

  return (
    <>
      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveNewsPage}>
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
            Public URL: <strong>{publicPath}</strong> · Edit the News landing page hero here.
            Individual articles are listed below.
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
              preferredName="news-hero"
              recommendedSize={IMAGE_SPECS.newsPageHero}
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
          <div className="admin-field">
            <label htmlFor="heroKicker">Kicker</label>
            <input id="heroKicker" name="heroKicker" defaultValue={settings.heroKicker} required />
          </div>
          <div className="admin-field">
            <label htmlFor="heroTitleLine1">Title line 1</label>
            <input
              id="heroTitleLine1"
              name="heroTitleLine1"
              defaultValue={settings.heroTitleLine1}
              required
            />
          </div>
          <div className="admin-field">
            <label htmlFor="heroTitleLine2">Title line 2 (emphasis)</label>
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
          <h2 style={{ marginTop: 0 }}>Empty-state badge</h2>
          <p style={{ marginTop: 0, color: "#64748b", fontSize: "0.875rem" }}>
            Shown on the hero badge when there are no published articles yet.
          </p>
          <div className="admin-field">
            <label htmlFor="emptyBadgeNumber">Badge number</label>
            <input
              id="emptyBadgeNumber"
              name="emptyBadgeNumber"
              defaultValue={settings.emptyBadgeNumber}
              required
            />
          </div>
          <div className="admin-field">
            <label htmlFor="emptyBadgeLabel">Badge label</label>
            <input
              id="emptyBadgeLabel"
              name="emptyBadgeLabel"
              defaultValue={settings.emptyBadgeLabel}
              required
            />
          </div>
        </section>

        <label>
          <input type="checkbox" name="published" defaultChecked={page.published} /> Published
        </label>

        <div style={{ marginTop: "1.25rem" }}>
          <button className="admin-btn" type="submit">
            Save News page
          </button>
        </div>
      </form>

      <div className="admin-panel" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
        <div className="admin-header" style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>News posts</h2>
          <Link className="admin-btn" href="/dashboard/news/new">
            Add news post
          </Link>
        </div>
        {posts.length === 0 ? (
          <p style={{ margin: 0, color: "#64748b" }}>
            No posts yet.{" "}
            <Link href="/dashboard/news/new">Create the first article</Link>.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Published</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/dashboard/news/${post.id}`} style={{ fontWeight: 600 }}>
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    <span className={`admin-badge ${post.published ? "admin-badge--live" : ""}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleString("en-AU")
                      : "—"}
                  </td>
                  <td>
                    <Link
                      className="admin-btn admin-btn--ghost admin-btn--small"
                      href={`/dashboard/news/${post.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
