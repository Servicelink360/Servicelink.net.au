import type { Metadata } from "next";
import Image from "@/components/SiteImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getService, getPublishedServices, isServicePublished } from "@/lib/services";
import {
  createPageMetadata,
  getBreadcrumbJsonLd,
  getServiceJsonLd,
} from "@/lib/seo";
import { getServiceDisplayImages } from "@/lib/service-display-images";
import { splitBodyParagraphs } from "@/lib/split-body";
import { getRelatedServices } from "./data";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { SiteServiceCard } from "./SiteServiceCard";
import { ServiceHighlightsAccordion } from "./ServiceHighlightsAccordion";
import { Service360Powered } from "./Service360Powered";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const published = await getPublishedServices();
  return published.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service || !(await isServicePublished(slug))) {
    return { title: "Service not found" };
  }

  return createPageMetadata({
    title: service.title,
    description: service.summary,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service || !(await isServicePublished(slug))) {
    notFound();
  }

  const related = await getRelatedServices(slug);
  const images = await getServiceDisplayImages(service.slug);

  return (
    <>
      <JsonLd
        data={[
          getServiceJsonLd(service),
          getBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/#work" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/#work">Services</Link>
              <span aria-hidden>/</span>
              <span>{service.title}</span>
            </nav>

            <p className="m1-label">Our services</p>
            <h1 className="m1-h1 m1-service-hero__title">{service.title}</h1>
            <p className="m1-service-hero__summary">{service.summary}</p>

            <div className="m1-service-hero__actions">
              <Link href={`/quote?service=${service.slug}`} className="m1-btn m1-btn--ink m1-btn--lg">
                Request a quote
              </Link>
              <Link href="/#work" className="m1-btn m1-btn--line m1-btn--lg">
                All services
              </Link>
            </div>
          </div>

          <div className="m1-service-hero__visual">
            <div className="m1-service-hero__frame">
              <Image
                src={images.heroImage}
                alt={`${service.title} services by Servicelink in Sydney and NSW`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="m1-service-hero__badge">
              <span className="m1-service-hero__badge-n m1-service-hero__badge-n--name">
                Our services
              </span>
              <span className="m1-service-hero__badge-l">{service.title}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">Overview</p>
            <p className="m1-service-overview__quote">{service.summary}</p>
          </div>
          <div className="m1-service-overview__body">
            {splitBodyParagraphs(service.description).map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="m1-section">
        <div className="m1-wrap">
          <div className="m1-section-top m1-reveal">
            <p className="m1-label">What we deliver</p>
            <h2 className="m1-h2">Key capabilities</h2>
          </div>

          <ServiceHighlightsAccordion items={service.highlights} />
        </div>
      </section>

      <Service360Powered
        serviceSlug={service.slug}
        serviceTitle={service.title}
      />

      <section className="m1-section">
        <div className="m1-wrap">
          <div className="m1-section-top m1-section-top--row m1-reveal">
            <div>
              <p className="m1-label">Explore more</p>
              <h2 className="m1-h2">Related services</h2>
            </div>
            <Link href="/#work" className="m1-service-related__all">
              View all services →
            </Link>
          </div>

          <div className="m1-cases">
            {related.map((item) => (
              <SiteServiceCard key={item.slug} service={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--ink m1-service-cta">
        <div className="m1-wrap m1-service-cta__inner">
          <div>
            <p className="m1-label m1-label--light">Get started</p>
            <h2 className="m1-h2 m1-h2--light">
              Ready to discuss your
              <br />
              <em>{service.title.toLowerCase()}</em> needs?
            </h2>
          </div>
          <div className="m1-service-cta__actions">
            <Link href={`/quote?service=${service.slug}`} className="m1-btn m1-btn--light m1-btn--lg">
              Request a quote
            </Link>
            <Link href="/contact" className="m1-btn m1-btn--line m1-btn--lg m1-btn--line-light">
              Contact us
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
