import Link from "next/link";
import type { LocationCity } from "@/lib/location-states";
import { LocationStateBrowser } from "./LocationStateBrowser";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

type LocationsIndexPageProps = {
  cities: LocationCity[];
  selectedState?: string | null;
};

export function LocationsIndexPage({ cities, selectedState }: LocationsIndexPageProps) {

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
          <LocationStateBrowser cities={cities} selectedState={selectedState} />
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
