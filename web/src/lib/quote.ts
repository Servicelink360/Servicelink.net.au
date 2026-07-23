import { and, eq, isNotNull } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { seoPages, seoServices } from "@/lib/db/schema";
import { services } from "@/lib/services";
import { getSeoPageByPath, type SeoPageRecord } from "@/lib/seo-content";

export function formatQuoteLocationLabel(page: SeoPageRecord): string {
  if (page.metro) {
    return `${page.metro.name}, ${page.city.name}`;
  }

  return `${page.city.name}, ${page.city.state}`;
}

export function formatQuoteServicePhrase(serviceTitle: string): string {
  const lower = serviceTitle.trim().toLowerCase();
  if (lower.endsWith(" services")) return lower;
  return `${lower} services`;
}

export function buildServiceQuoteSummary(serviceTitle: string): string {
  const servicePhrase = formatQuoteServicePhrase(serviceTitle);
  return `Tell us about your site and ${servicePhrase} requirements. Our team will follow up with a tailored proposal — clear scope, transparent pricing, and practical next steps.`;
}

export function buildQuoteRequestSummary(
  locationLabel: string,
  serviceTitle?: string | null,
): string {
  const servicePhrase = serviceTitle
    ? formatQuoteServicePhrase(serviceTitle)
    : "facilities services";

  return `Request pricing for ${servicePhrase} in ${locationLabel}. Tell us about your site and our team will follow up with a tailored proposal.`;
}

export function buildQuoteCtaHeading(
  locationLabel: string,
  serviceTitle?: string | null,
): string {
  const servicePhrase = serviceTitle
    ? formatQuoteServicePhrase(serviceTitle)
    : "facilities services";

  return `Ready to discuss ${servicePhrase} in ${locationLabel}?`;
}

export function buildQuoteUrl(page: SeoPageRecord): string {
  const params = new URLSearchParams();
  params.set("location", page.path);

  if (page.service?.linkedServiceSlug) {
    params.set("service", page.service.linkedServiceSlug);
  }

  return `/quote?${params.toString()}`;
}

export async function getLocationServiceSlugs(page: SeoPageRecord): Promise<string[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const conditions = [
    eq(seoPages.cityId, page.cityId),
    eq(seoPages.published, true),
    isNotNull(seoPages.seoServiceId),
  ];

  if (page.metroId) {
    conditions.push(eq(seoPages.metroId, page.metroId));
  }

  const rows = await db
    .select({ linkedServiceSlug: seoServices.linkedServiceSlug })
    .from(seoPages)
    .innerJoin(seoServices, eq(seoPages.seoServiceId, seoServices.id))
    .where(and(...conditions, eq(seoServices.published, true)));

  return [
    ...new Set(
      rows
        .map((row) => row.linkedServiceSlug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ];
}

export type QuotePageContext = {
  defaultLocation: string;
  defaultService: string;
  serviceSlugs: string[];
  locationPath: string;
  locationName: string;
  source: string;
};

export async function getQuotePageContext(
  locationPath?: string,
  serviceSlug?: string,
): Promise<QuotePageContext | null> {
  if (!locationPath) return null;

  const page = await getSeoPageByPath(locationPath);
  if (!page) return null;

  const serviceSlugs = await getLocationServiceSlugs(page);
  const linkedService = page.service?.linkedServiceSlug;
  const resolvedService =
    serviceSlug && services.some((service) => service.slug === serviceSlug)
      ? serviceSlug
      : linkedService && services.some((service) => service.slug === linkedService)
        ? linkedService
        : "";

  return {
    defaultLocation: formatQuoteLocationLabel(page),
    defaultService: resolvedService,
    serviceSlugs,
    locationPath: page.path,
    locationName: page.metro?.name ?? page.city.name,
    source: `quote-${page.path}`,
  };
}
