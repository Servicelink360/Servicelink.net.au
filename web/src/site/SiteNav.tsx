import { groupCitiesByState } from "@/lib/location-states";
import { getPublishedCities } from "@/lib/seo-content";
import { SiteNavClient } from "./SiteNavClient";

export async function SiteNav() {
  const cities = await getPublishedCities();
  return <SiteNavClient stateGroups={groupCitiesByState(cities)} />;
}
