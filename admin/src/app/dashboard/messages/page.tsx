import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { deleteMessage } from "@/lib/actions";

export default async function MessagesPage() {
  const rows = await getDb()
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Contact messages</h1>
      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Details</th>
              <th>Message</th>
              <th>Received</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No messages yet.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <br />
                    {row.email}
                  </td>
                  <td>
                    {row.company ? <div>Org: {row.company}</div> : null}
                    {row.phone ? <div>Phone: {row.phone}</div> : null}
                    {row.portfolioSize ? <div>Portfolio: {row.portfolioSize}</div> : null}
                    <div>Source: {row.source}</div>
                  </td>
                  <td style={{ maxWidth: "360px", whiteSpace: "pre-wrap" }}>{row.message}</td>
                  <td>{new Date(row.createdAt).toLocaleString("en-AU")}</td>
                  <td>
                    <form action={deleteMessage.bind(null, row.id)}>
                      <button className="admin-btn admin-btn--danger admin-btn--small" type="submit">
                        Delete
                      </button>
                    </form>
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
