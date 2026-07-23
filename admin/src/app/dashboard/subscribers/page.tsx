import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { deleteSubscriber, toggleSubscriber } from "@/lib/actions";

export default async function SubscribersPage() {
  const rows = await getDb()
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.subscribedAt));

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Subscribers</h1>
      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Source</th>
              <th>Status</th>
              <th>Subscribed</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>No subscribers yet.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{row.name ?? "—"}</td>
                  <td>{row.source}</td>
                  <td>
                    <span className={`admin-badge ${row.active ? "admin-badge--live" : ""}`}>
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(row.subscribedAt).toLocaleString("en-AU")}</td>
                  <td>
                    <div className="admin-actions">
                      <form action={toggleSubscriber.bind(null, row.id, !row.active)}>
                        <button className="admin-btn admin-btn--ghost admin-btn--small" type="submit">
                          {row.active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                      <form action={deleteSubscriber.bind(null, row.id)}>
                        <button className="admin-btn admin-btn--danger admin-btn--small" type="submit">
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
