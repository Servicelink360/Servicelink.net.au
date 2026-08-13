import Link from "next/link";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  contactMessages,
  siteVisits,
  subscribers,
  users,
} from "@/lib/db/schema";
import { getPublicSiteUrl } from "@/lib/site-url";

type Period = "7d" | "30d" | "all";

type CountRow = { label: string | null; total: number };
type DayRow = { day: string; views: number; visitors: number };
type PageVisitRow = {
  path: string | null;
  views: number;
  visitors: number;
  landings: number;
};
type PageEngineRow = {
  path: string | null;
  engine: string | null;
  views: number;
  visitors: number;
};
type LandingRow = { path: string | null; visitors: number; views: number };
type RecentVisitRow = {
  path: string;
  landingPath: string | null;
  searchEngine: string | null;
  trafficReferrer: string | null;
  createdAt: Date;
};

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function parsePeriod(value?: string): Period {
  if (value === "7d" || value === "all") return value;
  return "30d";
}

function periodStart(period: Period) {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : 30;
  return new Date(Date.now() - days * 86_400_000);
}

function sinceClause(column: unknown, start: Date | null) {
  return start ? sql`${column} >= ${start}` : sql`true`;
}

function pageHref(path: string) {
  if (!path.startsWith("/")) return null;
  return `${getPublicSiteUrl()}${path}`;
}

function mergeCounts(...lists: CountRow[][]) {
  const totals = new Map<string, number>();
  for (const list of lists) {
    for (const row of list) {
      const label = row.label?.trim() || "Unknown";
      totals.set(label, (totals.get(label) ?? 0) + Number(row.total || 0));
    }
  }
  return [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);
}

function engineLabel(value?: string | null) {
  return value?.trim() || "Direct";
}

function referrerHost(value?: string | null) {
  if (!value) return "—";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function formatWhen(value: Date) {
  return new Date(value).toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PageCell({ path }: { path?: string | null }) {
  const label = path?.trim() || "Unknown";
  const href = label.startsWith("/") ? pageHref(label) : null;
  if (!href) return <span>{label}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function enginesForPage(rows: PageEngineRow[], path: string) {
  return rows
    .filter((row) => (row.path || "Unknown") === path)
    .sort((a, b) => Number(b.views) - Number(a.views))
    .slice(0, 6);
}

function BarList({ rows, empty }: { rows: CountRow[]; empty: string }) {
  const max = Math.max(...rows.map((row) => row.total), 1);
  if (rows.length === 0) {
    return <p className="admin-stat-empty">{empty}</p>;
  }

  return (
    <div className="admin-stat-bars">
      {rows.map((row) => {
        const label = row.label?.trim() || "Unknown";
        const href = label.startsWith("/") ? pageHref(label) : null;
        return (
          <div key={label} className="admin-stat-bar">
            <div className="admin-stat-bar__label">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              ) : (
                label
              )}
            </div>
            <div className="admin-stat-bar__track">
              <div
                className="admin-stat-bar__fill"
                style={{ width: `${Math.max(6, (row.total / max) * 100)}%` }}
              />
            </div>
            <div className="admin-stat-bar__value">{row.total}</div>
          </div>
        );
      })}
    </div>
  );
}

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const period = parsePeriod((await searchParams).period);
  const start = periodStart(period);
  const db = getDb();
  const visitSince = sinceClause(siteVisits.createdAt, start);
  const messageSince = sinceClause(contactMessages.createdAt, start);
  const userSince = sinceClause(users.createdAt, start);
  const subSince = sinceClause(subscribers.subscribedAt, start);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyStart = start ?? new Date(Date.now() - 60 * 86_400_000);

  const [
    [visitTotals],
    [todayVisits],
    daily,
    topPages,
    engines,
    [leadTotals],
    [joinTotals],
    [subscriberTotals],
    messageEngines,
    joinEngines,
    subEngines,
    messagePages,
    joinPages,
    subPages,
    pageVisits,
    pageEngines,
    landingPages,
    recentVisits,
  ] = await Promise.all([
    db
      .select({
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
      })
      .from(siteVisits)
      .where(visitSince),
    db
      .select({
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
      })
      .from(siteVisits)
      .where(sql`${siteVisits.createdAt} >= ${todayStart}`),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${siteVisits.createdAt} at time zone 'Australia/Sydney'), 'YYYY-MM-DD')`,
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
      })
      .from(siteVisits)
      .where(sql`${siteVisits.createdAt} >= ${dailyStart}`)
      .groupBy(sql`date_trunc('day', ${siteVisits.createdAt} at time zone 'Australia/Sydney')`)
      .orderBy(sql`date_trunc('day', ${siteVisits.createdAt} at time zone 'Australia/Sydney')`),
    db
      .select({
        label: siteVisits.path,
        total: sql<number>`count(*)::int`,
      })
      .from(siteVisits)
      .where(visitSince)
      .groupBy(siteVisits.path)
      .orderBy(sql`count(*) desc`)
      .limit(12),
    db
      .select({
        label: sql<string>`coalesce(nullif(${siteVisits.searchEngine}, ''), 'Direct')`,
        total: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
      })
      .from(siteVisits)
      .where(visitSince)
      .groupBy(sql`coalesce(nullif(${siteVisits.searchEngine}, ''), 'Direct')`)
      .orderBy(sql`count(distinct ${siteVisits.sessionId}) desc`)
      .limit(12),
    db
      .select({
        messages: sql<number>`count(*)::int`,
        quotes: sql<number>`count(*) filter (where ${contactMessages.source} ilike 'quote%')::int`,
        contacts: sql<number>`count(*) filter (where ${contactMessages.source} not ilike 'quote%')::int`,
      })
      .from(contactMessages)
      .where(messageSince),
    db
      .select({
        joins: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(userSince),
    db
      .select({
        subscribers: sql<number>`count(*)::int`,
      })
      .from(subscribers)
      .where(subSince),
    db
      .select({
        label: sql<string>`coalesce(nullif(${contactMessages.searchEngine}, ''), 'Unknown')`,
        total: sql<number>`count(*)::int`,
      })
      .from(contactMessages)
      .where(messageSince)
      .groupBy(sql`coalesce(nullif(${contactMessages.searchEngine}, ''), 'Unknown')`),
    db
      .select({
        label: sql<string>`coalesce(nullif(${users.searchEngine}, ''), 'Unknown')`,
        total: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(userSince)
      .groupBy(sql`coalesce(nullif(${users.searchEngine}, ''), 'Unknown')`),
    db
      .select({
        label: sql<string>`coalesce(nullif(${subscribers.searchEngine}, ''), 'Unknown')`,
        total: sql<number>`count(*)::int`,
      })
      .from(subscribers)
      .where(subSince)
      .groupBy(sql`coalesce(nullif(${subscribers.searchEngine}, ''), 'Unknown')`),
    db
      .select({
        label: sql<string>`coalesce(nullif(${contactMessages.pagePath}, ''), 'Unknown')`,
        total: sql<number>`count(*)::int`,
      })
      .from(contactMessages)
      .where(messageSince)
      .groupBy(sql`coalesce(nullif(${contactMessages.pagePath}, ''), 'Unknown')`),
    db
      .select({
        label: sql<string>`coalesce(nullif(${users.pagePath}, ''), 'Unknown')`,
        total: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(userSince)
      .groupBy(sql`coalesce(nullif(${users.pagePath}, ''), 'Unknown')`),
    db
      .select({
        label: sql<string>`coalesce(nullif(${subscribers.pagePath}, ''), 'Unknown')`,
        total: sql<number>`count(*)::int`,
      })
      .from(subscribers)
      .where(subSince)
      .groupBy(sql`coalesce(nullif(${subscribers.pagePath}, ''), 'Unknown')`),
    db
      .select({
        path: siteVisits.path,
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
        landings: sql<number>`count(*) filter (where ${siteVisits.path} = ${siteVisits.landingPath})::int`,
      })
      .from(siteVisits)
      .where(visitSince)
      .groupBy(siteVisits.path)
      .orderBy(sql`count(*) desc`)
      .limit(50),
    db
      .select({
        path: siteVisits.path,
        engine: sql<string>`coalesce(nullif(${siteVisits.searchEngine}, ''), 'Direct')`,
        views: sql<number>`count(*)::int`,
        visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
      })
      .from(siteVisits)
      .where(visitSince)
      .groupBy(
        siteVisits.path,
        sql`coalesce(nullif(${siteVisits.searchEngine}, ''), 'Direct')`,
      )
      .orderBy(sql`count(*) desc`)
      .limit(80),
    db
      .select({
        path: sql<string>`coalesce(nullif(${siteVisits.landingPath}, ''), ${siteVisits.path})`,
        visitors: sql<number>`count(distinct ${siteVisits.sessionId})::int`,
        views: sql<number>`count(*) filter (where ${siteVisits.path} = ${siteVisits.landingPath})::int`,
      })
      .from(siteVisits)
      .where(visitSince)
      .groupBy(sql`coalesce(nullif(${siteVisits.landingPath}, ''), ${siteVisits.path})`)
      .orderBy(sql`count(distinct ${siteVisits.sessionId}) desc`)
      .limit(30),
    db
      .select({
        path: siteVisits.path,
        landingPath: siteVisits.landingPath,
        searchEngine: siteVisits.searchEngine,
        trafficReferrer: siteVisits.trafficReferrer,
        createdAt: siteVisits.createdAt,
      })
      .from(siteVisits)
      .where(visitSince)
      .orderBy(sql`${siteVisits.createdAt} desc`)
      .limit(40),
  ]);

  const dayRows = daily as DayRow[];
  const maxDayViews = Math.max(...dayRows.map((row) => row.views), 1);
  const leadEngines = mergeCounts(
    messageEngines as CountRow[],
    joinEngines as CountRow[],
    subEngines as CountRow[],
  );
  const leadPages = mergeCounts(
    messagePages as CountRow[],
    joinPages as CountRow[],
    subPages as CountRow[],
  );
  const pageVisitRows = pageVisits as PageVisitRow[];
  const pageEngineRows = pageEngines as PageEngineRow[];
  const landingRows = landingPages as LandingRow[];
  const recentRows = recentVisits as RecentVisitRow[];

  return (
    <>
      <div className="admin-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div>
          <h1 style={{ margin: 0 }}>Statistics</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Page visits, clicked pages, search engines, and where people contact, quote, join, or subscribe.
          </p>
        </div>
        <div className="admin-actions">
          {PERIODS.map((entry) => (
            <Link
              key={entry.value}
              className={`admin-btn admin-btn--small ${
                period === entry.value ? "" : "admin-btn--ghost"
              }`}
              href={`/dashboard/statistics?period=${entry.value}`}
            >
              {entry.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card-grid" style={{ marginBottom: "1.25rem" }}>
        <div className="admin-card">
          <strong>{todayVisits?.visitors ?? 0}</strong>
          <span>Visitors today</span>
        </div>
        <div className="admin-card">
          <strong>{todayVisits?.views ?? 0}</strong>
          <span>Page views today</span>
        </div>
        <div className="admin-card">
          <strong>{visitTotals?.visitors ?? 0}</strong>
          <span>Visitors ({period === "all" ? "all time" : period})</span>
        </div>
        <div className="admin-card">
          <strong>{visitTotals?.views ?? 0}</strong>
          <span>Page views ({period === "all" ? "all time" : period})</span>
        </div>
        <div className="admin-card">
          <strong>{leadTotals?.contacts ?? 0}</strong>
          <span>Contact messages</span>
        </div>
        <div className="admin-card">
          <strong>{leadTotals?.quotes ?? 0}</strong>
          <span>Quote requests</span>
        </div>
        <div className="admin-card">
          <strong>{joinTotals?.joins ?? 0}</strong>
          <span>Joined</span>
        </div>
        <div className="admin-card">
          <strong>{subscriberTotals?.subscribers ?? 0}</strong>
          <span>Subscribers</span>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h2 style={{ marginTop: 0 }}>Daily visitors</h2>
        {dayRows.length === 0 ? (
          <p className="admin-stat-empty">
            No visitor data yet. Numbers start from when tracking went live.
          </p>
        ) : (
          <div className="admin-stat-days">
            {dayRows.map((row) => (
              <div key={row.day} className="admin-stat-day" title={`${row.day}: ${row.visitors} visitors, ${row.views} views`}>
                <div
                  className="admin-stat-day__bar"
                  style={{ height: `${Math.max(8, (row.views / maxDayViews) * 120)}px` }}
                />
                <span>{row.day.slice(5)}</span>
                <small>{row.visitors}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          marginBottom: "1.25rem",
        }}
      >
        <section className="admin-panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Traffic source</h2>
          <BarList rows={engines as CountRow[]} empty="No traffic sources yet." />
        </section>
        <section className="admin-panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Top pages</h2>
          <BarList rows={topPages as CountRow[]} empty="No page views yet." />
        </section>
        <section className="admin-panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Enquiries by search engine</h2>
          <BarList
            rows={leadEngines}
            empty="No tracked enquiries yet. Older messages have no source."
          />
        </section>
        <section className="admin-panel" style={{ padding: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Enquiries by page</h2>
          <BarList
            rows={leadPages}
            empty="No tracked enquiry pages yet."
          />
        </section>
      </div>

      <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
        <div className="admin-stat-section">
          <h2>Page visits</h2>
          <p>Pages people opened, how many times, and which engine sent them.</p>
        </div>
        {pageVisitRows.length === 0 ? (
          <p className="admin-stat-empty" style={{ padding: "0 1.25rem 1.25rem" }}>
            No page visits yet. Counts start from when tracking went live.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Visitors</th>
                <th>Landed here</th>
                <th>From engine</th>
              </tr>
            </thead>
            <tbody>
              {pageVisitRows.map((row) => {
                const path = row.path?.trim() || "Unknown";
                const engines = enginesForPage(pageEngineRows, path);
                return (
                  <tr key={path}>
                    <td>
                      <PageCell path={path} />
                    </td>
                    <td>{row.views}</td>
                    <td>{row.visitors}</td>
                    <td>{row.landings}</td>
                    <td>
                      {engines.length === 0 ? (
                        "—"
                      ) : (
                        <div className="admin-engine-chips">
                          {engines.map((engine) => (
                            <span key={`${path}-${engine.engine}`} className="admin-badge">
                              {engineLabel(engine.engine)} · {engine.views}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          marginBottom: "1.25rem",
        }}
      >
        <div className="admin-panel">
          <div className="admin-stat-section">
            <h2>Pages by search engine</h2>
            <p>Which engine sent people to which page.</p>
          </div>
          {pageEngineRows.length === 0 ? (
            <p className="admin-stat-empty" style={{ padding: "0 1.25rem 1.25rem" }}>
              No engine data yet.
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Engine</th>
                  <th>Views</th>
                  <th>Visitors</th>
                </tr>
              </thead>
              <tbody>
                {pageEngineRows.map((row) => (
                  <tr key={`${row.path}-${row.engine}`}>
                    <td>
                      <PageCell path={row.path} />
                    </td>
                    <td>
                      <span className="admin-badge">{engineLabel(row.engine)}</span>
                    </td>
                    <td>{row.views}</td>
                    <td>{row.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-stat-section">
            <h2>Entry pages</h2>
            <p>First page clicked after arriving from Google or another source.</p>
          </div>
          {landingRows.length === 0 ? (
            <p className="admin-stat-empty" style={{ padding: "0 1.25rem 1.25rem" }}>
              No landing pages yet.
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Landed on</th>
                  <th>Visitors</th>
                  <th>First views</th>
                </tr>
              </thead>
              <tbody>
                {landingRows.map((row) => (
                  <tr key={row.path || "unknown"}>
                    <td>
                      <PageCell path={row.path} />
                    </td>
                    <td>{row.visitors}</td>
                    <td>{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-stat-section">
          <h2>Recent page clicks</h2>
          <p>Latest pages opened, with the engine and referrer for that visit.</p>
        </div>
        {recentRows.length === 0 ? (
          <p className="admin-stat-empty" style={{ padding: "0 1.25rem 1.25rem" }}>
            No recent clicks yet.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Page clicked</th>
                <th>Landed on</th>
                <th>Engine</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.map((row, index) => (
                <tr key={`${row.path}-${row.createdAt.toString()}-${index}`}>
                  <td>{formatWhen(row.createdAt)}</td>
                  <td>
                    <PageCell path={row.path} />
                  </td>
                  <td>
                    {row.landingPath && row.landingPath !== row.path ? (
                      <PageCell path={row.landingPath} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className="admin-badge">{engineLabel(row.searchEngine)}</span>
                  </td>
                  <td>
                    {row.trafficReferrer ? (
                      <a
                        href={row.trafficReferrer}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={row.trafficReferrer}
                      >
                        {referrerHost(row.trafficReferrer)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
