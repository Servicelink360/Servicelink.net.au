import Image from "@/components/SiteImage";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { LocationServiceCard } from "@/components/LocationServiceCard";
import { getBreadcrumbJsonLd, getServiceJsonLd } from "@/lib/seo";
import type { ResolvedLocationImages } from "@/lib/location-images";
import type { SeoLinkedSections, SeoPageLink, SeoPageRecord } from "@/lib/seo-content";
import { seoPageUrl } from "@/lib/seo-content";
import { buildQuoteUrl, buildQuoteCtaHeading } from "@/lib/quote";
import { splitBodyParagraphs } from "@/lib/split-body";
import { SiteFooter } from "@/site/SiteFooter";
import { SiteNav } from "@/site/SiteNav";

type SeoLandingPageProps = {
  page: SeoPageRecord;
  linked: SeoLinkedSections;
  images: ResolvedLocationImages;
};

function getHeroLabel(page: SeoPageRecord): string {
  if (page.service) return page.service.name;
  if (page.pageType === "metro_hub") return `${page.city.name}, ${page.city.state}`;
  if (page.metro) return `${page.metro.name}, ${page.city.name}`;
  return `${page.city.name}, ${page.city.state}`;
}

function getHeroTitle(page: SeoPageRecord): string {
  if (page.pageType === "metro_hub" && page.metro) return page.metro.name;
  return page.h1;
}

function isHubPage(page: SeoPageRecord): boolean {
  return page.pageType === "city_hub" || page.pageType === "metro_hub";
}

function formatStateDisplay(state: string) {
  const trimmed = state.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function getHeroBadge(page: SeoPageRecord): { value: string; label: string } {
  const state = formatStateDisplay(page.city.state);
  if (page.metro) {
    return { value: state, label: page.metro.name };
  }
  return { value: state, label: page.city.name };
}

function LocationServiceGrid({
  areaName,
  items,
}: {
  areaName: string;
  items: SeoPageLink[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="m1-section m1-section--work-top">
      <div className="m1-wrap m1-section-top m1-reveal">
        <p className="m1-label">Our services</p>
        <h2 className="m1-h2">Our services in {areaName}</h2>
      </div>

      <div className="m1-wrap">
        <div className="m1-cases">
          {items.map((item) => (
            <LocationServiceCard key={item.path} item={item} className="m1-reveal" />
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationLinkGrid({
  label,
  title,
  items,
}: {
  label: string;
  title: string;
  items: SeoPageLink[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="m1-section">
      <div className="m1-wrap">
        <div className="m1-section-top m1-reveal">
          <p className="m1-label">{label}</p>
          <h2 className="m1-h2">{title}</h2>
        </div>

        <ul className="m1-location-links">
          {items.map((item) => (
            <li key={item.path} className="m1-location-link">
              <Link href={seoPageUrl(item.path)} className="m1-location-link__inner">
                <span className="m1-location-link__title">{item.h1}</span>
                <span className="m1-location-link__summary">{item.metaDescription}</span>
                <span className="m1-location-link__more">View page →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SeoLandingPage({ page, linked, images }: SeoLandingPageProps) {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/locations" },
    { name: page.city.name, path: seoPageUrl(page.city.slug) },
  ];

  if (page.metro) {
    breadcrumbs.push({
      name: page.metro.name,
      path: seoPageUrl(`${page.city.slug}/${page.metro.slug}`),
    });
  }

  if (page.service) {
    breadcrumbs.push({
      name: page.service.name,
      path: seoPageUrl(page.path),
    });
  }

  const badge = getHeroBadge(page);
  const areaTitle = page.city.name;
  const metroSectionTitle =
    page.pageType === "city_service" && page.service
      ? `${page.service.name} by area`
      : `Areas we serve in ${areaTitle}`;
  const serviceAreaName =
    page.metro && page.pageType !== "city_hub" ? page.metro.name : areaTitle;

  const jsonLd = [
    getBreadcrumbJsonLd(breadcrumbs),
    ...(page.service
      ? [
          getServiceJsonLd({
            title: page.h1,
            summary: page.metaDescription,
            slug: page.path,
          }),
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              {breadcrumbs.map((item, index) => (
                <span key={item.path}>
                  {index > 0 ? <span aria-hidden> / </span> : null}
                  {index < breadcrumbs.length - 1 ? (
                    <Link href={item.path}>{item.name}</Link>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </span>
              ))}
            </nav>

            <p className="m1-label">{getHeroLabel(page)}</p>
            <h1 className="m1-h1 m1-service-hero__title">{getHeroTitle(page)}</h1>
            <p className="m1-service-hero__summary">{page.intro}</p>

            <div className="m1-service-hero__actions">
              <Link href={buildQuoteUrl(page)} className="m1-btn m1-btn--ink m1-btn--lg">
                Request a quote
              </Link>
              {page.service?.linkedServiceSlug ? (
                <Link
                  href={`/services/${page.service.linkedServiceSlug}`}
                  className="m1-btn m1-btn--line m1-btn--lg"
                >
                  Service overview
                </Link>
              ) : (
                <Link href={seoPageUrl(page.city.slug)} className="m1-btn m1-btn--line m1-btn--lg">
                  {page.city.name} overview
                </Link>
              )}
            </div>
          </div>

          <div className="m1-service-hero__visual">
            <div className="m1-service-hero__frame">
              <Image
                src={images.heroImage}
                alt={getHeroTitle(page)}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="m1-service-hero__badge">
              <span className="m1-service-hero__badge-n">{badge.value}</span>
              <span className="m1-service-hero__badge-l">{badge.label}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          {isHubPage(page) ? (
            <div className="m1-service-overview__body">
              <p className="m1-label">Overview</p>
              {splitBodyParagraphs(page.body).map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <>
              <div className="m1-service-overview__lead">
                <p className="m1-label">Overview</p>
                <p className="m1-service-overview__quote">{page.intro}</p>
              </div>
              <div className="m1-service-overview__body">
                {splitBodyParagraphs(page.body).map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <LocationLinkGrid
        label="Local areas"
        title={metroSectionTitle}
        items={linked.metroLinks}
      />

      <LocationServiceGrid areaName={serviceAreaName} items={linked.serviceLinks} />

      <section className="m1-section m1-section--ink m1-service-cta">
        <div className="m1-wrap m1-service-cta__inner">
          <div>
            <p className="m1-label m1-label--light">Get started</p>
            <h2 className="m1-h2 m1-h2--light">
              {buildQuoteCtaHeading(
                page.metro
                  ? `${page.metro.name}, ${page.city.name}`
                  : `${page.city.name}, ${page.city.state}`,
                page.service?.name,
              )}
            </h2>
            <p className="m1-service-cta__summary">
              Tell us about your site and our team will follow up with a tailored proposal.
            </p>
          </div>
          <div className="m1-service-cta__actions">
            <Link href={buildQuoteUrl(page)} className="m1-btn m1-btn--light m1-btn--lg">
              Request a quote
            </Link>
            <Link
              href={seoPageUrl(page.city.slug)}
              className="m1-btn m1-btn--line m1-btn--line-light m1-btn--lg"
            >
              {page.city.name} hub
            </Link>
          </div>
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
