import type { Metadata } from "next";
import { normalizeState, stateLabel } from "@/lib/location-states";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedCities } from "@/lib/seo-content";
import { LocationsIndexPage } from "@/site/LocationsIndexPage";

export const dynamic = "force-dynamic";

type LocationsPageProps = {
  searchParams: Promise<{ state?: string }>;
};

export async function generateMetadata({
  searchParams,
}: LocationsPageProps): Promise<Metadata> {
  const state = normalizeState((await searchParams).state);
  if (state) {
    const label = stateLabel(state);
    return createPageMetadata({
      title: `Locations in ${label}`,
      description: `Find Servicelink facilities management, cleaning, and maintenance services in cities across ${label}.`,
      path: `/locations?state=${state}`,
    });
  }

  return createPageMetadata({
    title: "Locations across Australia",
    description:
      "Find Servicelink facilities management, cleaning, and maintenance services in Sydney, Melbourne, Brisbane, Perth, and metro areas across Australia.",
    path: "/locations",
  });
}

export default async function LocationsPage({ searchParams }: LocationsPageProps) {
  const selectedState = normalizeState((await searchParams).state);
  const cities = await getPublishedCities();
  return <LocationsIndexPage cities={cities} selectedState={selectedState} />;
}
