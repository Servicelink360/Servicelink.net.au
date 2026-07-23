type LocationRef = {
  name: string;
  state: string;
};

type ServiceRef = {
  name: string;
  summary: string;
  description: string;
};

export type SeoPageType =
  | "city_hub"
  | "metro_hub"
  | "city_service"
  | "metro_service";

export function buildSeoPath(
  citySlug: string,
  metroSlug?: string | null,
  serviceSlug?: string | null,
): string {
  const parts = [citySlug];
  if (metroSlug) parts.push(metroSlug);
  if (serviceSlug) parts.push(serviceSlug);
  return parts.join("/");
}

export function inferSeoPageType(
  metroSlug?: string | null,
  serviceSlug?: string | null,
): SeoPageType {
  if (metroSlug && serviceSlug) return "metro_service";
  if (metroSlug) return "metro_hub";
  if (serviceSlug) return "city_service";
  return "city_hub";
}

export function buildSeoPageContent(
  pageType: SeoPageType,
  city: LocationRef,
  service?: ServiceRef | null,
  metro?: LocationRef | null,
) {
  if (pageType === "city_hub") {
    return {
      metaTitle: `Facilities Services in ${city.name}, ${city.state} | Servicelink`,
      metaDescription: `Servicelink delivers facilities management, cleaning, ground maintenance, tree services, building maintenance, and support services for businesses across ${city.name}, ${city.state} and surrounding metro areas.`,
      h1: `Facilities services in ${city.name}`,
      intro: `Servicelink delivers integrated facilities management, cleaning, maintenance, and specialist support for businesses across ${city.name} and nearby metro areas.`,
      body: `From commercial offices and retail sites to community facilities and multi-site portfolios, our team delivers consistent standards, clear reporting, and responsive support across ${city.state}. Explore metro areas and services below.`,
    };
  }

  if (pageType === "metro_hub" && metro) {
    return {
      metaTitle: `${metro.name} Facilities Services | ${city.name}, ${city.state}`,
      metaDescription: `Servicelink delivers facilities management, cleaning, maintenance, and support services for businesses in ${metro.name}, ${city.name}, ${city.state}.`,
      h1: metro.name,
      intro: `Servicelink delivers facilities management, cleaning, maintenance, and specialist support for businesses in ${metro.name} and the wider ${city.name}, ${city.state} region.`,
      body: `Whether you manage a single site or a multi-location portfolio in ${metro.name}, we deliver practical, accountable facilities services tailored to local businesses across ${city.name}.`,
    };
  }

  if (!service) {
    throw new Error("Service is required for service landing pages.");
  }

  if (pageType === "city_service") {
    return {
      metaTitle: `${service.name} in ${city.name}, ${city.state}`,
      metaDescription: `${service.summary} Servicelink delivers ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state}.`,
      h1: `${service.name} in ${city.name}`,
      intro: `Servicelink delivers professional ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state} — with clear communication and measurable results.`,
      body: `${service.description} We deliver ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state} and surrounding metro areas with responsive teams and documented service standards.`,
    };
  }

  if (!metro) {
    throw new Error("Metro is required for metro service landing pages.");
  }

  return {
    metaTitle: `${service.name} in ${metro.name}, ${city.name}`,
    metaDescription: `${service.summary} Servicelink delivers ${service.name.toLowerCase()} for businesses in ${metro.name}, ${city.name}, ${city.state}.`,
    h1: `${service.name} in ${metro.name}`,
    intro: `Servicelink delivers ${service.name.toLowerCase()} for businesses in ${metro.name}, ${city.name} and surrounding ${city.state} locations.`,
    body: `${service.description} We deliver reliable, audit-ready ${service.name.toLowerCase()} for businesses across ${metro.name} and ${city.name}.`,
  };
}
