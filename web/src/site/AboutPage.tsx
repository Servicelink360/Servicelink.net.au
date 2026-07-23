import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { buildContactUrl } from "@/lib/contact-context";
import { ABOUT_VALUES, COMPANY_STATS, getServiceImage } from "./data";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export const metadata: Metadata = createPageMetadata({
  title: "About Us",
  description:
    "Learn about Servicelink — your partner in facilities management across Sydney and NSW. Mission, values, and the team behind our services.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <span>About Us</span>
            </nav>

            <p className="m1-label">About Servicelink</p>
            <h1 className="m1-h1 m1-service-hero__title">
              Your partner in
              <br />
              <em>facilities.</em>
            </h1>
            <p className="m1-service-hero__summary">
              Servicelink is an Australian facilities management company delivering
              integrated services for businesses across Sydney and NSW — with care,
              accountability, and operational excellence since 2006.
            </p>

            <div className="m1-service-hero__actions">
              <Link href={buildContactUrl("about")} className="m1-btn m1-btn--ink m1-btn--lg">
                Get in touch
              </Link>
              <Link href="/#work" className="m1-btn m1-btn--line m1-btn--lg">
                Our services
              </Link>
            </div>
          </div>

          <div className="m1-service-hero__visual">
            <div className="m1-service-hero__frame">
              <Image
                src={getServiceImage("facilities-management")}
                alt="Servicelink facilities management team at a commercial site in Sydney"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="m1-service-hero__badge">
              <span className="m1-service-hero__badge-n">18</span>
              <span className="m1-service-hero__badge-l">Years of service</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">Our mission</p>
            <p className="m1-service-overview__quote">
              To deliver reliable, integrated facilities services that help businesses
              operate safely, efficiently, and with confidence.
            </p>
          </div>
          <div className="m1-service-overview__body">
            <p>
              We believe great facilities management is invisible when it is working
              well — and indispensable when it matters most. From cleaning and
              maintenance to grounds care and support services, Servicelink brings
              one accountable team to your portfolio.
            </p>
            <p>
              We work with offices, retail, industrial, healthcare, education, and
              multi-site businesses across NSW. Our approach is straightforward:
              understand your operations, set clear standards, and deliver consistent
              results you can measure.
            </p>
          </div>
        </div>
      </section>

      <section className="m1-section">
        <div className="m1-wrap">
          <div className="m1-section-top m1-reveal">
            <p className="m1-label">What we stand for</p>
            <h2 className="m1-h2">Our values</h2>
          </div>

          <ul className="m1-about-values">
            {ABOUT_VALUES.map((value, index) => (
              <li key={value.title} className="m1-about-value">
                <span className="m1-about-value__id">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m1-about-value__title">{value.title}</h3>
                  <p className="m1-about-value__text">{value.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="sl-page">
        <section className="sl-stats" aria-label="Key performance figures">
          <div className="sl-container">
            <div className="sl-stats__grid">
              {COMPANY_STATS.map((stat) => (
                <article key={stat.label} className="sl-stat">
                  <p className="sl-stat__value">{stat.value}</p>
                  <p className="sl-stat__label">{stat.label}</p>
                  <p className="sl-stat__detail">{stat.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="m1-section m1-section--ink m1-service-cta">
        <div className="m1-wrap m1-service-cta__inner">
          <div>
            <p className="m1-label m1-label--light">Work with us</p>
            <h2 className="m1-h2 m1-h2--light">
              Ready to talk about
              <br />
              <em>your facilities?</em>
            </h2>
          </div>
          <div className="m1-service-cta__actions">
            <Link href={buildContactUrl("about")} className="m1-btn m1-btn--light m1-btn--lg">
              Book a briefing
            </Link>
            <Link href="/#work" className="m1-btn m1-btn--line m1-btn--lg m1-btn--line-light">
              View services
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
