import Link from "next/link";
import { saveSitePage } from "@/lib/actions";

export default function NewPagePage() {
  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>Add custom page</h1>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/pages">
          Back
        </Link>
      </div>
      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveSitePage}>
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" required placeholder="about-us" />
        </div>
        <div className="admin-field">
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" rows={12} required />
        </div>
        <label>
          <input type="checkbox" name="published" /> Publish now
        </label>
        <button className="admin-btn" type="submit">
          Save page
        </button>
      </form>
    </>
  );
}
