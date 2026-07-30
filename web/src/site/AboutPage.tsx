import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { buildContactUrl } from "@/lib/contact-context";
import {
  formatCount,
  formatSitesBadge,
  getService360OpsStats,
} from "@/lib/service360-ops";
import {
  SERVICE360_ACCOUNTABILITY,
  SERVICE360_FLOW,
  SERVICE360_URL,
} from "./service360-content";
import { ABOUT_VALUES, COMPANY_STATS, getServiceImage } from "./data";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export const metadata: Metadata = createPageMetadata({
  title: "About Us",
  description:
    "Learn about Servicelink — facilities partner since 2018. Based in Five Dock, NSW, delivering integrated services powered by Service360.",
  path: "/about",
});

const STRENGTHS = [
  {
    title: "Proven experience",
    text: "Extensive work under structured contracts, tailored to local requirements, reporting expectations, and site conditions — including councils such as Inner West, Bayside, and Hunter’s Hill.",
  },
  {
    title: "Technology-led operations",
    text: "Every service is powered by Service360 — our own facilities management platform — so work is scheduled, tracked, evidenced, and reported in one system.",
  },
  {
    title: "Certified management systems",
    text: "ISO 9001 (Quality), ISO 14001 (Environment), and ISO 45001 (Health & safety).",
  },
  {
    title: "Safety and capability",
    text: "Structured training across induction, hazard identification, chemical handling, equipment use, emergency response, and incident reporting.",
  },
] as const;

const RISK_ITEMS = [
  "Site risk assessments and practical mitigation controls",
  "Contingency and business continuity planning",
  "Insurance cover including public liability and worker protection",
] as const;

const SUPPORT_ITEMS = [
  "Dedicated account managers and a clear complaints process",
  "24/7 emergency hotline for urgent site issues",
  "Local hiring and community engagement",
  "Client feedback through surveys and regular reviews",
] as const;

export default async function AboutPage() {
  const opsStats = await getService360OpsStats();
  const sitesLabel =
    opsStats.sitesCount > 0 ? formatSitesBadge(opsStats.sitesCount) : null;
  const sitesCopy =
    opsStats.sitesCount > 0 ? formatCount(opsStats.sitesCount) : null;
  const companyStats = COMPANY_STATS.map((stat) =>
    stat.label === "Sites under management" && sitesLabel
      ? { ...stat, value: sitesLabel, detail: "Live from Service360" }
      : stat,
  ).filter((stat) => !(stat.label === "Sites under management" && !sitesLabel));

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
              integrated services for councils and commercial portfolios across NSW —
              with care, accountability, and operational excellence since 2018.
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
              <span className="m1-service-hero__badge-n">8+</span>
              <span className="m1-service-hero__badge-l">Years of service</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">Company history</p>
            <p className="m1-service-overview__quote">
              Established 2018 · Head office, Five Dock, NSW
            </p>
          </div>
          <div className="m1-service-overview__body">
            <p>
              Servicelink was founded to deliver reliable facility services for
              organisations that need one accountable partner — starting with
              cleaning, grounds, tree management, and roof and gutter maintenance
              for local councils across Sydney.
            </p>
            <p>
              Early clients included Inner West Council, Bayside Council, and
              Hunter’s Hill Council. That public-sector work shaped how we operate
              today: clear scopes, consistent standards, and delivery built around
              compliance, safety, and measurable outcomes.
            </p>
            <p>
              Today Servicelink delivers integrated facilities services across NSW
              for councils and commercial portfolios — driven by reliability,
              accountability, and continuous improvement.
            </p>
          </div>
        </div>
      </section>

      <section className="m1-section">
        <div className="m1-wrap">
          <div className="m1-section-top m1-reveal">
            <p className="m1-label">Capabilities</p>
            <h2 className="m1-h2">What sets us apart</h2>
          </div>

          <ul className="m1-about-values">
            {STRENGTHS.map((item, index) => (
              <li key={item.title} className="m1-about-value">
                <span className="m1-about-value__id">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m1-about-value__title">{item.title}</h3>
                  <p className="m1-about-value__text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">Innovation &amp; technology</p>
            <p className="m1-service-overview__quote">
              Service360 — Servicelink’s purpose-built facilities management
              platform, connecting clients, facility managers, administrators and
              field teams through one secure system.
            </p>
          </div>
          <div className="m1-service-overview__body">
            <p>
              Service360 provides real-time visibility
              {sitesCopy
                ? ` across ${sitesCopy} active sites managed throughout Australia`
                : " across active sites managed throughout Australia"}
              . From routine cleaning and grounds maintenance to urgent repairs,
              asset inspections and specialist rooftop services, it records every
              request, scheduled task, report and outcome.
            </p>
            <p>
              This gives clients clear accountability, reliable evidence and a
              complete operational history across their portfolio — helping reduce
              missed work, improve response times and support measurable service
              performance.
            </p>
            <ul className="m1-s360-list">
              {SERVICE360_ACCOUNTABILITY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="m1-service-hero__actions">
              <Link href="/service360" className="m1-btn m1-btn--ink">
                About Service360
              </Link>
              <a
                href={SERVICE360_URL}
                className="m1-btn m1-btn--line"
                target="_blank"
                rel="noopener noreferrer"
              >
                service360.com.au
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section">
        <div className="m1-wrap">
          <div className="m1-section-top m1-reveal">
            <p className="m1-label">From request to result</p>
            <h2 className="m1-h2">
              Completed, documented
              <br />
              <em>and visible.</em>
            </h2>
          </div>

          <ol className="m1-s360-flow">
            {SERVICE360_FLOW.map((step, index) => (
              <li key={step} className="m1-s360-flow__step">
                <span className="m1-s360-flow__n">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="m1-s360-flow__label">{step}</span>
              </li>
            ))}
          </ol>

          <p className="m1-s360-flow__note">
            Service360 gives clients confidence that work is not only scheduled,
            but completed, documented and visible.
          </p>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">Risk &amp; support</p>
            <p className="m1-service-overview__quote">
              Safe operations, continuity planning, and client support when it
              matters — including a 24/7 emergency hotline.
            </p>
          </div>
          <div className="m1-service-overview__body">
            <p>
              <strong>Risk, compliance &amp; continuity</strong>
            </p>
            <ul className="m1-s360-list">
              {RISK_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              <strong>Client support &amp; community</strong>
            </p>
            <ul className="m1-s360-list">
              {SUPPORT_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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
              {companyStats.map((stat) => (
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
            <Link href="/quote" className="m1-btn m1-btn--light m1-btn--lg">
              Free Quote
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
