import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sitePages } from "@/lib/db/schema";
import { deleteSitePage } from "@/lib/actions";
import {
  formatSitePageType,
  getSystemSitePagePublicPath,
  isSystemSitePageSlug,
} from "@/lib/site-pages";

export default async function PagesPage() {
  const rows = await getDb().select().from(sitePages).orderBy(asc(sitePages.pageType), desc(sitePages.updatedAt));

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>Pages</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Homepage and core site pages are managed here alongside custom pages.
          </p>
        </div>
        <Link className="admin-btn" href="/dashboard/pages/new">
          Add custom page
        </Link>
      </div>
      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Public URL</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>No pages yet.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const publicPath =
                  getSystemSitePagePublicPath(row.slug) ??
                  (row.pageType === "standard" ? `/${row.slug}` : null);

                return (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{formatSitePageType(row.pageType)}</td>
                    <td>{publicPath ?? "—"}</td>
                    <td>
                      <span className={`admin-badge ${row.published ? "admin-badge--live" : ""}`}>
                        {row.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>{new Date(row.updatedAt).toLocaleString("en-AU")}</td>
                    <td>
                      <div className="admin-actions">
                        <Link
                          className="admin-btn admin-btn--ghost admin-btn--small"
                          href={`/dashboard/pages/${row.id}`}
                        >
                          Edit
                        </Link>
                        {isSystemSitePageSlug(row.slug) ? null : (
                          <form action={deleteSitePage.bind(null, row.id)}>
                            <button className="admin-btn admin-btn--danger admin-btn--small" type="submit">
                              Delete
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
