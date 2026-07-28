import Link from "next/link";
import { NewsFeaturedImageField } from "@/components/NewsFeaturedImageField";
import { saveNewsPost } from "@/lib/actions";
import type { NewsPost } from "@/lib/db/schema";

type NewsPostFormProps = {
  post?: NewsPost;
};

export function NewsPostForm({ post }: NewsPostFormProps) {
  const isEdit = Boolean(post);

  return (
    <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveNewsPost}>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="admin-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={post?.title ?? ""} required />
      </div>

      <div className="admin-field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          defaultValue={post?.slug ?? ""}
          required
          placeholder="welcome-to-servicelink"
        />
        <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.8125rem" }}>
          Public URL: /news/{post?.slug || "your-slug"}
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={post?.summary ?? ""}
          required
        />
      </div>

      <div className="admin-field">
        <label htmlFor="body">Body</label>
        <textarea id="body" name="body" rows={12} defaultValue={post?.body ?? ""} required />
        <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.8125rem" }}>
          Plain text or simple HTML is fine. Line breaks are preserved on the site.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="metaTitle">SEO title (optional)</label>
        <input
          id="metaTitle"
          name="metaTitle"
          defaultValue={post?.metaTitle ?? ""}
          placeholder="Defaults to post title"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="metaDescription">SEO description (optional)</label>
        <textarea
          id="metaDescription"
          name="metaDescription"
          rows={3}
          defaultValue={post?.metaDescription ?? ""}
        />
      </div>

      <NewsFeaturedImageField
        defaultSlug={post?.slug ?? ""}
        defaultValue={post?.featuredImage ?? ""}
      />

      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
        {isEdit ? "Published" : "Publish now"}
      </label>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <button className="admin-btn" type="submit">
          {isEdit ? "Save changes" : "Save post"}
        </button>
        {post?.published && post.slug ? (
          <Link
            className="admin-btn admin-btn--ghost"
            href={`https://www.servicelink.net.au/news/${post.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            View on site
          </Link>
        ) : null}
      </div>
    </form>
  );
}
