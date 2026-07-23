import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { site } from "@/lib/site";
import HomePage from "@/site/HomePage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Servicelink — Your Partner in Facilities",
    description: site.description,
    path: "/",
  });
}

export default async function Page() {
  const settings = await getHomepageSettings();
  return <HomePage settings={settings} />;
}
