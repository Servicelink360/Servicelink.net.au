import Link from "next/link";
import {
  groupCitiesByState,
  stateHref,
  stateLabel,
  type LocationCity,
} from "@/lib/location-states";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

type LocationsIndexPageProps = {
  cities: LocationCity[];
  selectedState?: string | null;
};

function CityList({ cities }: { cities: LocationCity[] }) {
  return (
    <ul className="m1-location-links">
      {cities.map((city) => (
        <li key={city.id} className="m1-location-link">
          <Link href={`/locations/${city.slug}`} className="m1-location-link__inner">
            <span className="m1-location-link__title">
              {city.name}, {city.state}
            </span>
            <span className="m1-location-link__summary">
              Facilities management, cleaning, maintenance, and support services delivered
              across {city.name} and surrounding metro areas.
            </span>
            <span className="m1-location-link__more">View {city.name} →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LocationsIndexPage({ cities, selectedState }: LocationsIndexPageProps) {
  const groups = groupCitiesByState(cities);
  const activeGroup = selectedState
    ? groups.find((group) => group.code === selectedState)
    : null;
  const visibleCities = activeGroup?.cities ?? cities;
  const heading = activeGroup
    ? `Cities in ${activeGroup.label}`
    : "Cities & metro areas";
  const summary = activeGroup
    ? `All Servicelink cities across ${activeGroup.label}. Choose a city to see local metro areas and services.`
    : "Servicelink delivers facilities management, cleaning, maintenance, and specialist support by city and metro area across Australia.";

  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden> / </span>
              {activeGroup ? (
                <>
                  <Link href="/locations">Locations</Link>
                  <span aria-hidden> / </span>
                  <span>{activeGroup.label}</span>
                </>
              ) : (
                <span>Locations</span>
              )}
            </nav>

            <p className="m1-label">
              {activeGroup ? activeGroup.label : "Australia-wide coverage"}
            </p>
            <h1 className="m1-h1 m1-service-hero__title">
              {activeGroup ? `${activeGroup.label} locations` : "Servicelink locations"}
            </h1>
            <p className="m1-service-hero__summary">{summary}</p>

            <div className="m1-service-hero__actions">
              <Link href="/quote" className="m1-btn m1-btn--ink m1-btn--lg">
                Request a quote
              </Link>
              <Link href="/#work" className="m1-btn m1-btn--line m1-btn--lg">
                All services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap">
          <div className="m1-section-top">
            <p className="m1-label">Where we work</p>
            <h2 className="m1-h2">{heading}</h2>
          </div>

          {groups.length > 0 ? (
            <div className="m1-location-states">
              <Link
                href="/locations"
                className={`m1-location-state ${activeGroup ? "" : "m1-location-state--active"}`}
              >
                All
              </Link>
              {groups.map((group) => (
                <Link
                  key={group.code}
                  href={stateHref(group.code)}
                  className={`m1-location-state ${
                    activeGroup?.code === group.code ? "m1-location-state--active" : ""
                  }`}
                >
                  {group.label}
                </Link>
              ))}
            </div>
          ) : null}

          {visibleCities.length === 0 ? (
            <p className="m1-join__lead">
              {activeGroup
                ? `No published cities in ${stateLabel(activeGroup.code)} yet.`
                : "Location pages will appear here once configured in the admin panel."}
            </p>
          ) : activeGroup ? (
            <CityList cities={visibleCities} />
          ) : (
            groups.map((group) => (
              <div key={group.code} className="m1-location-group">
                <div className="m1-location-group__head">
                  <h3 className="m1-h3">{group.label}</h3>
                  <Link href={group.href}>View all {group.label} cities →</Link>
                </div>
                <CityList cities={group.cities} />
              </div>
            ))
          )}
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
