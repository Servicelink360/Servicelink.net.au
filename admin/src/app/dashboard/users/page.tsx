import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { deleteUser } from "@/lib/actions";

export default async function UsersPage() {
  const rows = await getDb().select().from(users).orderBy(desc(users.createdAt));

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Users</h1>
      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No registered users yet.</td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleString("en-AU")}</td>
                  <td>
                    <form action={deleteUser.bind(null, user.id)}>
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
