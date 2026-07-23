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
      metaTitle: `Facilities Management in ${city.name}, ${city.state}`,
      metaDescription: `Servicelink delivers integrated facilities management, cleaning, and maintenance for businesses across ${city.name}, ${city.state} and surrounding metro areas.`,
      h1: `Facilities management in ${city.name}`,
      intro: `Servicelink supports businesses across ${city.name} and nearby metro areas with reliable cleaning, maintenance, and integrated facilities management.`,
      body: `From commercial offices and retail sites to community facilities and multi-site portfolios, our ${city.name} team delivers consistent standards, clear reporting, and responsive support across ${city.state}.`,
    };
  }

  if (pageType === "metro_hub" && metro) {
    return {
      metaTitle: `Facilities Management in ${metro.name}, ${city.name}`,
      metaDescription: `Professional facilities management for businesses in ${metro.name}, ${city.name}, ${city.state}. Servicelink provides cleaning, maintenance, and support services locally.`,
      h1: `Facilities management in ${metro.name}`,
      intro: `Servicelink provides local facilities management services for businesses in ${metro.name} and the wider ${city.name}, ${city.state} region.`,
      body: `Whether you manage a single site or a multi-location portfolio in ${metro.name}, our team delivers practical, accountable facilities services tailored to local businesses across ${city.name}.`,
    };
  }

  if (!service) {
    throw new Error("Service is required for service landing pages.");
  }

  if (pageType === "city_service") {
    return {
      metaTitle: `${service.name} in ${city.name}, ${city.state}`,
      metaDescription: `${service.summary} Servicelink provides ${service.name.toLowerCase()} for businesses across ${city.name}, ${city.state}.`,
      h1: `${service.name} in ${city.name}`,
      intro: `Looking for dependable ${service.name.toLowerCase()} in ${city.name}? Servicelink delivers professional service with clear communication and measurable results.`,
      body: `${service.description} We support businesses across ${city.name}, ${city.state} and surrounding metro areas with responsive teams and documented service standards.`,
    };
  }

  if (!metro) {
    throw new Error("Metro is required for metro service landing pages.");
  }

  return {
    metaTitle: `${service.name} in ${metro.name}, ${city.name}`,
    metaDescription: `${service.summary} Local ${service.name.toLowerCase()} for businesses in ${metro.name}, ${city.name}, ${city.state}.`,
    h1: `${service.name} in ${metro.name}`,
    intro: `Servicelink provides ${service.name.toLowerCase()} for businesses in ${metro.name}, ${city.name} and surrounding ${city.state} locations.`,
    body: `${service.description} Our ${metro.name} team understands local operational needs and delivers reliable, audit-ready service across ${city.name}.`,
  };
}
