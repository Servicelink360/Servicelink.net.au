"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  groupCitiesByState,
  stateHref,
  stateLabel,
  type LocationCity,
} from "@/lib/location-states";

type LocationStateBrowserProps = {
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

export function LocationStateBrowser({
  cities,
  selectedState = null,
}: LocationStateBrowserProps) {
  const router = useRouter();
  const groups = useMemo(() => groupCitiesByState(cities), [cities]);
  const [active, setActive] = useState<string | null>(selectedState);

  useEffect(() => {
    setActive(selectedState ?? null);
  }, [selectedState]);

  const activeGroup = active ? groups.find((group) => group.code === active) : null;
  const heading = activeGroup ? `Cities in ${activeGroup.label}` : "Cities & metro areas";

  function selectState(code: string | null) {
    setActive(code);
    router.replace(code ? stateHref(code) : "/locations", { scroll: false });
  }

  return (
    <>
      <div className="m1-section-top">
        <p className="m1-label">Where we work</p>
        <h2 className="m1-h2">{heading}</h2>
      </div>

      {groups.length > 0 ? (
        <div className="m1-location-states" role="tablist" aria-label="Filter by state">
          <button
            type="button"
            role="tab"
            aria-selected={!activeGroup}
            className={`m1-location-state ${activeGroup ? "" : "m1-location-state--active"}`}
            onClick={() => selectState(null)}
          >
            All
          </button>
          {groups.map((group) => (
            <button
              key={group.code}
              type="button"
              role="tab"
              aria-selected={activeGroup?.code === group.code}
              className={`m1-location-state ${
                activeGroup?.code === group.code ? "m1-location-state--active" : ""
              }`}
              onClick={() => selectState(group.code)}
            >
              {group.label}
            </button>
          ))}
        </div>
      ) : null}

      {!activeGroup && groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.code} className="m1-location-group">
            <div className="m1-location-group__head">
              <h3 className="m1-h3">{group.label}</h3>
              <button
                type="button"
                className="m1-location-group__all"
                onClick={() => selectState(group.code)}
              >
                View all {group.label} cities →
              </button>
            </div>
            <CityList cities={group.cities} />
          </div>
        ))
      ) : activeGroup && activeGroup.cities.length === 0 ? (
        <p className="m1-join__lead">No published cities in {stateLabel(activeGroup.code)} yet.</p>
      ) : activeGroup ? (
        <CityList cities={activeGroup.cities} />
      ) : (
        <p className="m1-join__lead">
          Location pages will appear here once configured in the admin panel.
        </p>
      )}
    </>
  );
}
