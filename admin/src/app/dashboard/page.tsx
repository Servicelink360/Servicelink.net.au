import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  contactMessages,
  newsPosts,
  sitePages,
  subscribers,
  users,
} from "@/lib/db/schema";

export default async function DashboardPage() {
  const db = getDb();

  const [[userCount], [subscriberCount], [messageCount], [newsCount], [pageCount]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(subscribers),
      db.select({ count: sql<number>`count(*)::int` }).from(contactMessages),
      db.select({ count: sql<number>`count(*)::int` }).from(newsPosts),
      db.select({ count: sql<number>`count(*)::int` }).from(sitePages),
    ]);

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div className="admin-card-grid">
        <div className="admin-card">
          <strong>{userCount.count}</strong>
          <span>Registered users</span>
        </div>
        <div className="admin-card">
          <strong>{subscriberCount.count}</strong>
          <span>Subscribers</span>
        </div>
        <div className="admin-card">
          <strong>{messageCount.count}</strong>
          <span>Contact messages</span>
        </div>
        <div className="admin-card">
          <strong>{newsCount.count}</strong>
          <span>News posts</span>
        </div>
        <div className="admin-card">
          <strong>{pageCount.count}</strong>
          <span>Site pages</span>
        </div>
      </div>
    </>
  );
}
