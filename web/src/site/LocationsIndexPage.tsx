import Link from "next/link";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

type City = {
  id: string;
  slug: string;
  name: string;
  state: string;
};

type LocationsIndexPageProps = {
  cities: City[];
};

export function LocationsIndexPage({ cities }: LocationsIndexPageProps) {
  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden> / </span>
              <span>Locations</span>
            </nav>

            <p className="m1-label">Australia-wide coverage</p>
            <h1 className="m1-h1 m1-service-hero__title">Servicelink locations</h1>
            <p className="m1-service-hero__summary">
              Servicelink delivers facilities management, cleaning, maintenance, and specialist
              support by city and metro area across Australia.
            </p>

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
            <h2 className="m1-h2">Cities &amp; metro areas</h2>
          </div>

          {cities.length === 0 ? (
            <p className="m1-join__lead">
              Location pages will appear here once configured in the admin panel.
            </p>
          ) : (
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
          )}
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
