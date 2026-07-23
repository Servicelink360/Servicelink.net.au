import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { locations } from "@/lib/db/schema";

type LocationsDashboardProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function LocationsDashboard({
  searchParams,
}: LocationsDashboardProps) {
  const query = (await searchParams).q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase();
  const db = getDb();

  const [allCities, metros] = await Promise.all([
    db
      .select({
        id: locations.id,
        slug: locations.slug,
        name: locations.name,
        state: locations.state,
        heroImage: locations.heroImage,
        published: locations.published,
      })
      .from(locations)
      .where(and(eq(locations.type, "city"), isNull(locations.parentId)))
      .orderBy(asc(locations.state), asc(locations.sortOrder), asc(locations.name)),
    db
      .select({
        parentId: locations.parentId,
        name: locations.name,
        slug: locations.slug,
      })
      .from(locations)
      .where(eq(locations.type, "metro")),
  ]);

  const searchableMetrosByCity = new Map<string, string>();
  for (const metro of metros) {
    if (!metro.parentId) continue;
    const searchableMetro = `${metro.name} ${metro.slug}`.toLocaleLowerCase();
    searchableMetrosByCity.set(
      metro.parentId,
      `${searchableMetrosByCity.get(metro.parentId) ?? ""} ${searchableMetro}`,
    );
  }

  const cities = normalizedQuery
    ? allCities.filter((city) =>
        `${city.name} ${city.slug} ${city.state ?? ""} ${
          searchableMetrosByCity.get(city.id) ?? ""
        }`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : allCities;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 style={{ margin: 0 }}>Location images</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
            Upload city-specific images for Sydney and other active markets. Cities without
            custom images use generic SEO service defaults.
          </p>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: "1rem" }}>
        <form
          method="get"
          action="/dashboard/locations"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search city, metro, state or slug"
            aria-label="Search locations"
            style={{
              width: "min(100%, 28rem)",
              minHeight: "2.5rem",
              padding: "0.55rem 0.75rem",
              border: "1px solid #cbd5e1",
              borderRadius: "0.5rem",
              font: "inherit",
            }}
          />
          <button className="admin-btn" type="submit">
            Search
          </button>
          {query ? (
            <Link className="admin-btn admin-btn--ghost" href="/dashboard/locations">
              Clear
            </Link>
          ) : null}
          <span style={{ color: "#64748b", fontSize: "0.8125rem" }}>
            {cities.length} {cities.length === 1 ? "city" : "cities"}
            {query ? ` matching “${query}”` : ""}
          </span>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>City</th>
              <th>State</th>
              <th>Hub hero</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cities.length ? (
              cities.map((city) => (
                <tr key={city.id}>
                  <td>{city.name}</td>
                  <td>{city.state}</td>
                  <td>{city.heroImage ? "Custom" : "Generic"}</td>
                  <td>{city.published ? "Published" : "Hidden"}</td>
                  <td>
                    <Link
                      className="admin-btn admin-btn--ghost"
                      href={`/dashboard/locations/${city.id}`}
                    >
                      Manage images
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center" }}>
                  No locations found for “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
