import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { saveNewsPost } from "@/lib/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { IMAGE_SPECS } from "@/lib/image-specs";

type EditNewsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params;
  const [post] = await getDb().select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1);

  if (!post) notFound();

  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>Edit news post</h1>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/news">
          Back
        </Link>
      </div>
      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveNewsPost}>
        <input type="hidden" name="id" value={post.id} />
        <div className="admin-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={post.title} required />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={post.slug} required />
        </div>
        <div className="admin-field">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" rows={3} defaultValue={post.summary} required />
        </div>
        <div className="admin-field">
          <label htmlFor="body">Body</label>
          <textarea id="body" name="body" rows={8} defaultValue={post.body} required />
        </div>
        <div className="admin-field">
          <label htmlFor="metaTitle">SEO title (optional)</label>
          <input id="metaTitle" name="metaTitle" defaultValue={post.metaTitle ?? ""} />
        </div>
        <div className="admin-field">
          <label htmlFor="metaDescription">SEO description (optional)</label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={3}
            defaultValue={post.metaDescription ?? ""}
          />
        </div>
        <div className="admin-field">
          <ImageUploadField
            name="featuredImage"
            label="Featured image"
            defaultValue={post.featuredImage}
            uploadScope={`news/${post.slug}`}
            preferredName="featured"
            recommendedSize={IMAGE_SPECS.newsFeatured}
          />
        </div>
        <label>
          <input type="checkbox" name="published" defaultChecked={post.published} /> Published
        </label>
        <button className="admin-btn" type="submit">
          Save changes
        </button>
      </form>
    </>
  );
}
