import Link from "next/link";
import { and, asc, count, desc, eq, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/lib/db";
import { locations, seoPages, seoServices } from "@/lib/db/schema";
import { deleteSeoPage } from "@/lib/actions";
import { SeoPagesTable } from "./SeoPagesTable";

const cityLoc = alias(locations, "city_loc");
const metroLoc = alias(locations, "metro_loc");

const PAGE_TYPES = [
  { value: "city_hub", label: "City hub" },
  { value: "metro_hub", label: "Metro hub" },
  { value: "city_service", label: "City + service" },
  { value: "metro_service", label: "Metro + service" },
] as const;

const SORT_OPTIONS = [
  { value: "updated-desc", label: "Recently updated" },
  { value: "updated-asc", label: "Oldest updated" },
  { value: "location-asc", label: "Location A–Z" },
  { value: "service-asc", label: "Service A–Z" },
  { value: "status-desc", label: "Published first" },
  { value: "status-asc", label: "Draft first" },
  { value: "type-asc", label: "Page type" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type NavLevel = "states" | "cities" | "metros";

type SeoPagesDashboardProps = {
  searchParams: Promise<{
    state?: string;
    city?: string;
    metro?: string;
    service?: string;
    status?: string;
    type?: string;
    sort?: string;
    nav?: string;
  }>;
};

function pageTypeLabel(pageType: string) {
  return PAGE_TYPES.find((entry) => entry.value === pageType)?.label ?? pageType;
}

function buildFilterQuery(
  current: Record<string, string | undefined>,
  updates: Record<string, string | undefined | null>,
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...updates };

  for (const [key, value] of Object.entries(merged)) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function SeoPagesDashboard({ searchParams }: SeoPagesDashboardProps) {
  const params = await searchParams;
  const db = getDb();

  const stateFilter = params.state?.trim().toUpperCase() || undefined;
  const cityFilter = params.city?.trim() || undefined;
  const metroFilter = params.metro?.trim() || undefined;
  const serviceFilter = params.service?.trim() || undefined;
  const statusFilter = params.status?.trim() || undefined;
  const typeFilter = params.type?.trim() || undefined;
  const sort = (SORT_OPTIONS.some((option) => option.value === params.sort)
    ? params.sort
    : "location-asc") as SortValue;

  const navLevel: NavLevel =
    params.nav === "metros" || params.nav === "cities" ? params.nav : "states";

  const filters: SQL[] = [];
  // "Cities" nav keeps full city → metro hierarchy (includes metro pages).
  // "Metros" nav is a flat metro-only list.
  if (navLevel === "metros") {
    filters.push(isNotNull(seoPages.metroId));
  }
  if (stateFilter) filters.push(eq(cityLoc.state, stateFilter));
  if (cityFilter) filters.push(eq(seoPages.cityId, cityFilter));
  if (metroFilter) filters.push(eq(seoPages.metroId, metroFilter));
  if (serviceFilter) filters.push(eq(seoPages.seoServiceId, serviceFilter));
  if (statusFilter === "published") filters.push(eq(seoPages.published, true));
  if (statusFilter === "draft") filters.push(eq(seoPages.published, false));
  if (typeFilter) filters.push(eq(seoPages.pageType, typeFilter));

  const whereClause = filters.length ? and(...filters) : undefined;

  const orderByClause = (() => {
    switch (sort) {
      case "updated-asc":
        return [asc(seoPages.updatedAt)];
      case "location-asc":
        return [
          asc(cityLoc.state),
          asc(cityLoc.name),
          asc(metroLoc.name),
          asc(seoPages.path),
        ];
      case "service-asc":
        return [asc(seoServices.name), asc(seoPages.path)];
      case "status-desc":
        return [desc(seoPages.published), asc(seoPages.path)];
      case "status-asc":
        return [asc(seoPages.published), asc(seoPages.path)];
      case "type-asc":
        return [asc(seoPages.pageType), asc(seoPages.path)];
      default:
        return [desc(seoPages.updatedAt)];
    }
  })();

  const [
    cities,
    metros,
    services,
    [pageStats],
    typeCounts,
    rows,
  ] = await Promise.all([
    db
      .select()
      .from(locations)
      .where(and(eq(locations.type, "city"), isNull(locations.parentId)))
      .orderBy(asc(locations.state), asc(locations.sortOrder), asc(locations.name)),
    db
      .select({
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
        state: locations.state,
        parentId: locations.parentId,
        cityName: cityLoc.name,
        citySlug: cityLoc.slug,
      })
      .from(locations)
      .innerJoin(cityLoc, eq(locations.parentId, cityLoc.id))
      .where(eq(locations.type, "metro"))
      .orderBy(asc(cityLoc.name), asc(locations.sortOrder), asc(locations.name)),
    db.select().from(seoServices).orderBy(asc(seoServices.sortOrder), asc(seoServices.name)),
    db
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${seoPages.published})::int`,
        draft: sql<number>`count(*) filter (where not ${seoPages.published})::int`,
      })
      .from(seoPages),
    db
      .select({ pageType: seoPages.pageType, total: count() })
      .from(seoPages)
      .groupBy(seoPages.pageType)
      .orderBy(asc(seoPages.pageType)),
    db
      .select({
        id: seoPages.id,
        path: seoPages.path,
        pageType: seoPages.pageType,
        h1: seoPages.h1,
        published: seoPages.published,
        state: cityLoc.state,
        cityName: cityLoc.name,
        metroName: metroLoc.name,
        serviceName: seoServices.name,
      })
      .from(seoPages)
      .innerJoin(cityLoc, eq(seoPages.cityId, cityLoc.id))
      .leftJoin(metroLoc, eq(seoPages.metroId, metroLoc.id))
      .leftJoin(seoServices, eq(seoPages.seoServiceId, seoServices.id))
      .where(whereClause)
      .orderBy(...orderByClause),
  ]);

  const total = pageStats?.total ?? 0;
  const published = pageStats?.published ?? 0;
  const draft = pageStats?.draft ?? 0;
  const tableRows = rows.map((row) => ({
    ...row,
    pageTypeLabel: pageTypeLabel(row.pageType),
  }));

  const selectedCity = cityFilter ? cities.find((city) => city.id === cityFilter) : undefined;
  const activeState = stateFilter ?? selectedCity?.state;

  const filteredCount = rows.length;
  const hasLocationFilter = Boolean(stateFilter || cityFilter || metroFilter);
  const hasNavFilter = navLevel !== "states";
  const hasFilters = Boolean(
    hasLocationFilter || serviceFilter || statusFilter || typeFilter || hasNavFilter,
  );

  const statesInDb = [...new Set(cities.map((city) => city.state))].sort();
  const citiesForState = activeState ? cities.filter((city) => city.state === activeState) : cities;
  const metrosForCity = cityFilter
    ? metros.filter((metro) => metro.parentId === cityFilter)
    : activeState
      ? metros.filter((metro) => metro.state === activeState)
      : metros;

  const currentFilters = {
    state: activeState,
    city: cityFilter,
    metro: metroFilter,
    service: serviceFilter,
    status: statusFilter,
    type: typeFilter,
    sort,
    nav: navLevel,
  };

  const navLabel =
    navLevel === "cities"
      ? "Browse by city (includes metros)"
      : navLevel === "metros"
        ? "Metro-level pages"
        : "All pages by state";

  const tabBase = {
    service: serviceFilter,
    status: statusFilter,
    type: typeFilter,
    sort,
    state: activeState,
    city: cityFilter,
    metro: metroFilter,
  };

  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>SEO Pages</h1>
        <Link className="admin-btn" href="/dashboard/seo-pages/new">
          Add SEO page
        </Link>
      </div>

      <div className="admin-card-grid" style={{ marginBottom: "1rem" }}>
        <div className="admin-card">
          <strong>{total}</strong>
          <span>Total pages</span>
        </div>
        <div className="admin-card">
          <strong>{published}</strong>
          <span>Published</span>
        </div>
        <div className="admin-card">
          <strong>{draft}</strong>
          <span>Draft</span>
        </div>
        <div className="admin-card">
          <strong>{filteredCount}</strong>
          <span>{hasFilters ? "Matching filters" : "Showing all"}</span>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem", fontSize: "0.8125rem" }}>
          {typeCounts.map((entry) => (
            <Link
              key={entry.pageType}
              href={`/dashboard/seo-pages${buildFilterQuery(currentFilters, {
                type: entry.pageType,
              })}`}
              style={{
                color: typeFilter === entry.pageType ? "#0f172a" : "#64748b",
                fontWeight: typeFilter === entry.pageType ? 600 : 400,
              }}
            >
              {pageTypeLabel(entry.pageType)}: {entry.total}
            </Link>
          ))}
        </div>
      </div>

      <form className="admin-panel admin-filters" method="get">
        <input type="hidden" name="nav" value={navLevel} />
        <div className="admin-field">
          <label htmlFor="state">State</label>
          <select id="state" name="state" defaultValue={activeState ?? ""}>
            <option value="">All states</option>
            {statesInDb.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="city">City</label>
          <select id="city" name="city" defaultValue={cityFilter ?? ""}>
            <option value="">All cities</option>
            {citiesForState.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
                {!activeState ? ` (${city.state})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="metro">Metro</label>
          <select id="metro" name="metro" defaultValue={metroFilter ?? ""}>
            <option value="">All metros</option>
            {metrosForCity.map((metro) => (
              <option key={metro.id} value={metro.id}>
                {metro.name}
                {!cityFilter ? ` (${metro.cityName})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="service">Service</label>
          <select id="service" name="service" defaultValue={serviceFilter ?? ""}>
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={statusFilter ?? ""}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="type">Page type</label>
          <select id="type" name="type" defaultValue={typeFilter ?? ""}>
            <option value="">All types</option>
            {PAGE_TYPES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={sort}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-filters__actions">
          <button className="admin-btn" type="submit">
            Apply
          </button>
          {hasFilters ? (
            <Link className="admin-btn admin-btn--ghost" href="/dashboard/seo-pages">
              Clear all
            </Link>
          ) : null}
        </div>
      </form>

      <div className="admin-panel" style={{ padding: "1rem 1.25rem", margin: "1rem 0" }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Location pages are generated automatically for all cities when you run{" "}
          <code>npm run db:generate-seo-pages</code> in the <code>web</code> project (also runs as
          part of <code>npm run db:seed-seo</code>). Use the table below to browse, edit, publish, or
          unpublish individual pages.
        </p>
      </div>

      <div className="admin-panel">
        <div className="admin-loc-nav__tabs admin-loc-nav__tabs--table">
          <Link
            className={`admin-loc-nav__tab ${navLevel === "states" ? "admin-loc-nav__tab--active" : ""}`}
            href={`/dashboard/seo-pages${buildFilterQuery(tabBase, {
              state: null,
              city: null,
              metro: null,
              nav: "states",
              sort: "location-asc",
            })}`}
          >
            States
          </Link>
          <Link
            className={`admin-loc-nav__tab ${navLevel === "cities" ? "admin-loc-nav__tab--active" : ""}`}
            href={`/dashboard/seo-pages${buildFilterQuery(tabBase, {
              metro: null,
              nav: "cities",
              sort: "location-asc",
            })}`}
          >
            Cities
          </Link>
          <Link
            className={`admin-loc-nav__tab ${navLevel === "metros" ? "admin-loc-nav__tab--active" : ""}`}
            href={`/dashboard/seo-pages${buildFilterQuery(tabBase, {
              nav: "metros",
              sort: "location-asc",
            })}`}
          >
            Metros
          </Link>
        </div>

        <div className="admin-table-meta">
          Showing {filteredCount} of {total} pages — {navLabel}
          {hasFilters ? " (filtered)" : ""}
          <span className="admin-table-meta__hint">Use + to expand groups</span>
        </div>
        <SeoPagesTable rows={tableRows} deleteSeoPage={deleteSeoPage} />
      </div>
    </>
  );
}
