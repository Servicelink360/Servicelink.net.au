import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedCities } from "@/lib/seo-content";
import { LocationsIndexPage } from "@/site/LocationsIndexPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Locations across Australia",
  description:
    "Find Servicelink facilities management, cleaning, and maintenance services in Sydney, Melbourne, Brisbane, Perth, and metro areas across Australia.",
  path: "/locations",
});

export default async function LocationsPage() {
  const cities = await getPublishedCities();
  return <LocationsIndexPage cities={cities} />;
}
