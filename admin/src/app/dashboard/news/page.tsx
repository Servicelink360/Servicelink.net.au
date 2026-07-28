import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { newsPosts } from "@/lib/db/schema";
import { deleteNewsPost } from "@/lib/actions";

export default async function NewsPage() {
  const rows = await getDb().select().from(newsPosts).orderBy(desc(newsPosts.createdAt));

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>News</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Create and edit posts shown on{" "}
            <a href="https://www.servicelink.net.au/news" target="_blank" rel="noreferrer">
              /news
            </a>
            .
          </p>
        </div>
        <Link className="admin-btn" href="/dashboard/news/new">
          Add news post
        </Link>
      </div>
      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Published</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  No news posts yet.{" "}
                  <Link href="/dashboard/news/new">Add your first post</Link> to edit it here.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/dashboard/news/${row.id}`} style={{ fontWeight: 600 }}>
                      {row.title}
                    </Link>
                  </td>
                  <td>{row.slug}</td>
                  <td>
                    <span className={`admin-badge ${row.published ? "admin-badge--live" : ""}`}>
                      {row.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    {row.publishedAt
                      ? new Date(row.publishedAt).toLocaleString("en-AU")
                      : "—"}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Link
                        className="admin-btn admin-btn--ghost admin-btn--small"
                        href={`/dashboard/news/${row.id}`}
                      >
                        Edit
                      </Link>
                      {row.published ? (
                        <Link
                          className="admin-btn admin-btn--ghost admin-btn--small"
                          href={`https://www.servicelink.net.au/news/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </Link>
                      ) : null}
                      <form action={deleteNewsPost.bind(null, row.id)}>
                        <button
                          className="admin-btn admin-btn--danger admin-btn--small"
                          type="submit"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
