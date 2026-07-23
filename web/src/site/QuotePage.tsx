import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { getQuotePageContext, buildQuoteRequestSummary, buildServiceQuoteSummary } from "@/lib/quote";
import { getPublishedServices, services } from "@/lib/services";
import { site } from "@/lib/site";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { SiteQuoteForm } from "./SiteQuoteForm";

export const metadata: Metadata = createPageMetadata({
  title: "Request a Quote",
  description:
    "Request a tailored quote for facilities management, cleaning, maintenance, and support services across Australia.",
  path: "/quote",
});

type QuotePageProps = {
  searchParams: Promise<{ service?: string; location?: string }>;
};

function pageServiceTitle(serviceSlug?: string) {
  if (!serviceSlug) return null;
  return services.find((service) => service.slug === serviceSlug)?.title ?? null;
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const { service: serviceSlug, location: locationPath } = await searchParams;
  const phoneHref = site.contact.phone.replace(/\s/g, "");
  const locationContext = await getQuotePageContext(locationPath, serviceSlug);
  const publishedServices = await getPublishedServices();

  const allowedSlugs = locationContext?.serviceSlugs.length
    ? new Set(locationContext.serviceSlugs)
    : null;

  const filteredServices =
    allowedSlugs && allowedSlugs.size > 0
      ? publishedServices.filter((service) => allowedSlugs.has(service.slug))
      : publishedServices;

  const defaultServiceCandidate =
    locationContext?.defaultService ||
    (serviceSlug && publishedServices.some((service) => service.slug === serviceSlug)
      ? serviceSlug
      : "");

  const defaultService = filteredServices.some(
    (service) => service.slug === defaultServiceCandidate,
  )
    ? defaultServiceCandidate
    : "";

  const serviceOptions = filteredServices.map((service) => ({
    slug: service.slug,
    title: service.title,
  }));

  const selectedService = filteredServices.find((service) => service.slug === defaultService);
  const selectedServiceTitle =
    selectedService?.title ?? pageServiceTitle(serviceSlug);

  const summary = locationContext
    ? buildQuoteRequestSummary(
        locationContext.defaultLocation,
        selectedServiceTitle,
      )
    : selectedServiceTitle
      ? buildServiceQuoteSummary(selectedServiceTitle)
      : "Tell us about your site and service requirements. Our team will follow up with a tailored proposal — clear scope, transparent pricing, and practical next steps.";

  const quoteSource = locationContext
    ? locationContext.source
    : defaultService
      ? `quote-service-${defaultService}`
      : "quote-page";

  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid m1-service-hero__grid--form">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              {locationContext ? (
                <>
                  <Link href="/locations">Locations</Link>
                  <span aria-hidden>/</span>
                  <Link href={`/locations/${locationContext.locationPath}`}>
                    {locationContext.locationName}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              ) : selectedServiceTitle && defaultService ? (
                <>
                  <Link href={`/services/${defaultService}`}>{selectedServiceTitle}</Link>
                  <span aria-hidden>/</span>
                </>
              ) : null}
              <span>Quote</span>
            </nav>

            <p className="m1-label">Request a quote</p>
            <h1 className="m1-h1 m1-service-hero__title">
              {locationContext ? (
                <>
                  Pricing in
                  <br />
                  <em>{locationContext.locationName}.</em>
                </>
              ) : selectedServiceTitle ? (
                <>
                  Pricing for
                  <br />
                  <em>{selectedServiceTitle.toLowerCase()}.</em>
                </>
              ) : (
                <>
                  Pricing for
                  <br />
                  <em>your facilities.</em>
                </>
              )}
            </h1>
            <p className="m1-service-hero__summary">{summary}</p>

            <div className="m1-service-hero__actions">
              <a href={`tel:${phoneHref}`} className="m1-btn m1-btn--ink m1-btn--lg">
                Call {site.contact.phone}
              </a>
              <Link href="/#work" className="m1-btn m1-btn--line m1-btn--lg">
                Our services
              </Link>
            </div>
          </div>

          <div className="m1-service-hero__form">
            <SiteQuoteForm
              services={serviceOptions}
              defaultService={defaultService}
              defaultLocation={locationContext?.defaultLocation ?? ""}
              locationPath={locationContext?.locationPath ?? ""}
              source={quoteSource}
            />
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-quote-steps">
          <p className="m1-label">What happens next</p>
          <h2 className="m1-h2">How quoting works</h2>
          <ol className="m1-quote-steps__list">
            <li>
              <strong>We review your request</strong>
              <span>
                Our team assesses your site, service scope, and portfolio size.
              </span>
            </li>
            <li>
              <strong>We prepare a tailored quote</strong>
              <span>
                You receive clear pricing and scope — not a generic rate card.
              </span>
            </li>
            <li>
              <strong>We schedule a briefing</strong>
              <span>
                Walk through the proposal and answer any questions before you
                decide.
              </span>
            </li>
          </ol>
          <p className="m1-join__meta">
            General enquiry instead?{" "}
            <Link href="/contact" className="m1-join__link">
              Contact our team
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
