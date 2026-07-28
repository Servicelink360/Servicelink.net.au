import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { saveSitePage } from "@/lib/actions";
import { HomepagePageForm } from "@/components/HomepagePageForm";
import { NewsPageForm } from "@/components/NewsPageForm";
import { Service360PageForm } from "@/components/Service360PageForm";
import { TemplateSitePageForm } from "@/components/TemplateSitePageForm";
import { formatSitePageType, getSystemSitePagePublicPath } from "@/lib/site-pages";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const [page] = await getDb().select().from(sitePages).where(eq(sitePages.id, id)).limit(1);

  if (!page) notFound();

  const publicPath = getSystemSitePagePublicPath(page.slug);

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>{page.title}</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            {formatSitePageType(page.pageType)}
            {publicPath ? ` · ${publicPath}` : ""}
          </p>
        </div>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/pages">
          Back to pages
        </Link>
      </div>

      {page.pageType === "homepage" ? <HomepagePageForm page={page} /> : null}

      {page.pageType === "service360" ? <Service360PageForm page={page} /> : null}

      {page.pageType === "news" ? <NewsPageForm page={page} /> : null}

      {page.pageType === "template" ? <TemplateSitePageForm page={page} /> : null}

      {page.pageType === "standard" ? (
        <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveSitePage}>
          <input type="hidden" name="id" value={page.id} />
          <div className="admin-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" defaultValue={page.title} required />
          </div>
          <div className="admin-field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={page.slug} required />
          </div>
          <div className="admin-field">
            <label htmlFor="content">Content</label>
            <textarea id="content" name="content" rows={12} defaultValue={page.content} required />
          </div>
          <label>
            <input type="checkbox" name="published" defaultChecked={page.published} /> Published
          </label>
          <button className="admin-btn" type="submit">
            Save changes
          </button>
        </form>
      ) : null}
    </>
  );
}
