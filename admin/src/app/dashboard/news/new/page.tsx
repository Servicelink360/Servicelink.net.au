import Link from "next/link";
import { saveNewsPost } from "@/lib/actions";
import { NewsFeaturedImageField } from "@/components/NewsFeaturedImageField";

export default function NewNewsPage() {
  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>Add news post</h1>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/news">
          Back
        </Link>
      </div>
      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveNewsPost}>
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" required placeholder="welcome-to-servicelink" />
        </div>
        <div className="admin-field">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" rows={3} required />
        </div>
        <div className="admin-field">
          <label htmlFor="body">Body</label>
          <textarea id="body" name="body" rows={8} required />
        </div>
        <div className="admin-field">
          <label htmlFor="metaTitle">SEO title (optional)</label>
          <input id="metaTitle" name="metaTitle" placeholder="Defaults to post title" />
        </div>
        <div className="admin-field">
          <label htmlFor="metaDescription">SEO description (optional)</label>
          <textarea id="metaDescription" name="metaDescription" rows={3} />
        </div>
        <NewsFeaturedImageField />
        <label>
          <input type="checkbox" name="published" /> Publish now
        </label>
        <button className="admin-btn" type="submit">
          Save post
        </button>
      </form>
    </>
  );
}
