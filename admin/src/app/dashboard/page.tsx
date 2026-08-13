import Link from "next/link";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  contactMessages,
  newsPosts,
  sitePages,
  siteVisits,
  subscribers,
  users,
} from "@/lib/db/schema";

export default async function DashboardPage() {
  const db = getDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [[userCount], [subscriberCount], [messageCount], [newsCount], [pageCount], [todayVisits]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(subscribers),
      db.select({ count: sql<number>`count(*)::int` }).from(contactMessages),
      db.select({ count: sql<number>`count(*)::int` }).from(newsPosts),
      db.select({ count: sql<number>`count(*)::int` }).from(sitePages),
      db
        .select({
          views: sql<number>`count(*)::int`,
          visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
        })
        .from(siteVisits)
        .where(sql`${siteVisits.createdAt} >= CAST(${todayStart.toISOString()} AS timestamptz)`),
    ]);

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div className="admin-card-grid">
        <Link className="admin-card" href="/dashboard/statistics">
          <strong>{todayVisits?.visitors ?? 0}</strong>
          <span>Visitors today</span>
        </Link>
        <Link className="admin-card" href="/dashboard/statistics">
          <strong>{todayVisits?.views ?? 0}</strong>
          <span>Page views today</span>
        </Link>
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
