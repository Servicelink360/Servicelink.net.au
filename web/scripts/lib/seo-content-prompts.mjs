import { SERVICE_DEFINITIONS } from "./service-definitions.mjs";

const BRAND = "Servicelink";

export function buildServicesPrompt() {
  const serviceList = SERVICE_DEFINITIONS.map(
    (service, index) =>
      `${index + 1}. ${service.name} (seoSlug: "${service.seoSlug}", staticSlug: "${service.staticSlug}") — ${service.focus}`,
  ).join("\n");

  return `You are writing website content for ${BRAND}, an Australian facilities management company serving commercial and multi-site businesses nationwide.

Write detailed, professional content for each service below. Use Australian English. Be specific and practical — explain what the service includes, who it is for, and why it matters. Avoid generic filler, superlatives, and keyword stuffing.

Services:
${serviceList}

Return JSON only with this exact shape:
{
  "services": [
    {
      "seoSlug": "facilities-management",
      "staticSlug": "facilities-management",
      "title": "Facilities Management",
      "summary": "1–2 sentence overview for cards and meta.",
      "description": "3–4 paragraphs (200–350 words) explaining the service in depth for business decision-makers.",
      "highlights": [
        { "title": "Short capability name", "detail": "2–3 sentences explaining this capability, outcomes, and how ${BRAND} delivers it." }
      ]
    }
  ]
}

Rules:
- Include exactly 7 services in the same order as listed above.
- Each service must have exactly 5 highlights with distinct, non-overlapping topics.
- summary: max 220 characters.
- description: plain text paragraphs separated by blank lines (use \\n\\n).
- Do not mention specific cities unless relevant to national scope.
- Do not invent certifications, awards, or client names.`;
}

/**
 * @param {{ slug: string, name: string, state: string, metros: { slug: string, name: string }[] }} city
 * @param {{ seoSlug: string, name: string, focus: string }} service
 */
export function buildLocationServicePrompt(city, service) {
  const metroList =
    city.metros.length > 0
      ? city.metros.map((metro) => `- ${metro.name} (slug: "${metro.slug}")`).join("\n")
      : "(no metro areas — cityService only)";

  return `You are writing SEO landing page content for ${BRAND}, an Australian facilities management company.

Location: ${city.name}, ${city.state}
Service: ${service.name} — ${service.focus}

Metro areas within ${city.name}:
${metroList}

Write location-specific content that references ${city.name} and ${city.state} naturally (local business context, climate, commercial property types common in the region). Each page must properly explain what ${service.name} includes and why local businesses choose ${BRAND}. Content must be unique — not a find-and-replace of another city.

Return JSON only:
{
  "cityService": {
    "metaTitle": "max 60 chars, include service and ${city.name}",
    "metaDescription": "max 155 chars, compelling summary for search",
    "h1": "clear page heading",
    "intro": "2–3 sentences, location-specific hook",
    "body": "3–4 paragraphs (250–400 words) explaining ${service.name} in ${city.name}, ${city.state} — scope, benefits, industries served, and how ${BRAND} delivers"
  },
  "metroServices": [
    {
      "metroSlug": "parramatta",
      "metaTitle": "max 60 chars",
      "metaDescription": "max 155 chars",
      "h1": "heading with metro name",
      "intro": "2–3 sentences specific to this metro",
      "body": "2–3 paragraphs (180–280 words) tailored to businesses in this metro area"
    }
  ]
}

Rules:
- cityService is required.
- metroServices must include one entry for every metro slug listed above (same slugs, same count).
- Use plain text in body fields; separate paragraphs with \\n\\n.
- Do not invent street addresses, phone numbers, or client names.
- metaTitle and metaDescription must fit typical SEO length limits.
- Do not append "| Servicelink" (or the brand name) to metaTitle — branding is added by the site.`;
}

/**
 * Hub pages (city overview + metro overviews) — not service-specific.
 * @param {{ slug: string, name: string, state: string }} city
 * @param {{ slug: string, name: string }[]} metros
 * @param {{ includeCityHub?: boolean }} [options]
 */
export function buildLocationHubPrompt(city, metros, options = {}) {
  const includeCityHub = options.includeCityHub !== false;
  const metroList =
    metros.length > 0
      ? metros.map((metro) => `- ${metro.name} (slug: "${metro.slug}")`).join("\n")
      : "(no metro hubs in this batch)";

  const cityHubBlock = includeCityHub
    ? `"cityHub": {
    "metaTitle": "max 60 chars, facilities services in ${city.name}",
    "metaDescription": "max 155 chars",
    "h1": "clear city hub heading",
    "intro": "2–3 sentences introducing ${BRAND} across ${city.name}",
    "body": "3–4 paragraphs (250–400 words) covering the range of facilities services for businesses in ${city.name}, ${city.state}, local commercial context, and how to explore metro areas and services"
  },`
    : `"cityHub": null,`;

  return `You are writing SEO hub/landing page content for ${BRAND}, an Australian facilities management company.

Location: ${city.name}, ${city.state}

These pages are location hubs (overviews), not single-service pages. Cover the full facilities offering at a high level: facilities management, cleaning, ground maintenance, tree services, building maintenance, roof/gutter/solar cleaning, asset management, and support services.

Metro areas in this batch:
${metroList}

Write location-specific content that references ${city.name} and ${city.state} naturally. Each metro hub must feel unique to that suburb/metro — not a find-and-replace of another area.

Return JSON only:
{
  ${cityHubBlock}
  "metroHubs": [
    {
      "metroSlug": "mosman",
      "metaTitle": "max 60 chars, include metro and ${city.name}",
      "metaDescription": "max 155 chars",
      "h1": "heading with metro name",
      "intro": "2–3 sentences specific to this metro",
      "body": "2–3 paragraphs (180–280 words) tailored to businesses in this metro — property types, commercial context, and why local operators choose ${BRAND}"
    }
  ]
}

Rules:
- ${includeCityHub ? "cityHub is required." : "cityHub must be null (metro hubs only in this batch)."}
- metroHubs must include one entry for every metro slug listed above (same slugs, same count).
- Use plain text in body fields; separate paragraphs with \\n\\n.
- Do not invent street addresses, phone numbers, or client names.
- metaTitle and metaDescription must fit typical SEO length limits.
- Do not append "| Servicelink" (or the brand name) to metaTitle — branding is added by the site.
- Do not invent certifications, awards, or named clients.`;
}
