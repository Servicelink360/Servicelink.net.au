import type { Metadata } from "next";
import Image from "@/components/SiteImage";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { buildContactUrl } from "@/lib/contact-context";
import { getService360Settings } from "@/lib/service360-settings";
import {
  formatCount,
  formatSitesBadge,
  getService360OpsStats,
} from "@/lib/service360-ops";
import {
  SERVICE360_ACCOUNTABILITY,
  SERVICE360_FLOW,
  SERVICE360_SUPPORTS,
  SERVICE360_URL,
} from "./service360-content";
import { Service360OpsMetrics } from "./Service360OpsMetrics";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export const metadata: Metadata = createPageMetadata({
  title: "Service360",
  description:
    "Service360 is Servicelink’s facilities management platform — real-time visibility across 370+ active sites, with work orders, faults, evidence and reporting in one system.",
  path: "/service360",
});

export default async function Service360Page() {
  const settings = await getService360Settings();
  const opsStats = await getService360OpsStats();
  const sitesBadge =
    opsStats.sitesCount > 0
      ? formatSitesBadge(opsStats.sitesCount)
      : settings.badgeNumber;
  const sitesCopy =
    opsStats.sitesCount > 0
      ? formatCount(opsStats.sitesCount)
      : "370";

  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <span>Service360</span>
            </nav>

            <p className="m1-label">{settings.heroKicker}</p>
            <h1 className="m1-h1 m1-service-hero__title">
              {settings.heroTitleLine1}
              <br />
              <em>{settings.heroTitleLine2}</em>
            </h1>
            <p className="m1-service-hero__summary">{settings.heroSummary}</p>

            <div className="m1-service-hero__actions">
              <a
                href={SERVICE360_URL}
                className="m1-btn m1-btn--ink m1-btn--lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discover Service360
              </a>
              <Link href={buildContactUrl("service360")} className="m1-btn m1-btn--line m1-btn--lg">
                Talk to us
              </Link>
            </div>
          </div>

          <div className="m1-service-hero__visual">
            <div className="m1-service-hero__frame">
              <Image
                src={settings.heroImage}
                alt="Service360 facilities management operations across Servicelink sites"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="m1-service-hero__badge">
              <span className="m1-service-hero__badge-n">{sitesBadge}</span>
              <span className="m1-service-hero__badge-l">{settings.badgeLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">What it is</p>
            <p className="m1-service-overview__quote">
              Servicelink’s purpose-built facilities management platform —
              connecting clients, facility managers, administrators and field
              teams through one secure system.
            </p>
          </div>
          <div className="m1-service-overview__body">
            <p>
              Service360 provides real-time visibility across more than{" "}
              {sitesCopy} active sites managed throughout Australia. From
              routine cleaning and grounds maintenance to urgent repairs, asset
              inspections and specialist rooftop services, it records every
              request, scheduled task, report and outcome.
            </p>
            <p>
              This gives clients clear accountability, reliable evidence and a
              complete operational history across their portfolio.
            </p>
            <Service360OpsMetrics stats={opsStats} />
          </div>
        </div>
      </section>

      <section className="m1-section">
        <div className="m1-wrap">
          <div className="m1-section-top m1-reveal">
            <p className="m1-label">How it supports our services</p>
            <h2 className="m1-h2">Built into every delivery</h2>
          </div>

          <div className="m1-s360-supports">
            {SERVICE360_SUPPORTS.map((item, index) => (
              <article key={item.slug} className="m1-s360-support m1-reveal">
                <div className="m1-s360-support__head">
                  <span className="m1-s360-support__id">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="m1-s360-support__title">
                      <Link href={`/services/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="m1-s360-support__tagline">{item.tagline}</p>
                  </div>
                </div>
                <div className="m1-s360-support__body">
                  {item.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
                <ul className="m1-s360-support__caps">
                  {item.capabilities.map((cap) => (
                    <li key={cap}>{cap}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-service-overview">
          <div className="m1-service-overview__lead">
            <p className="m1-label">Built for accountability</p>
            <p className="m1-service-overview__quote">
              A shared source of truth for Servicelink and its clients — each
              site, task, fault and report recorded in one platform.
            </p>
          </div>
          <div className="m1-service-overview__body">
            <p>
              Service360 helps reduce missed work, improve response times and
              support measurable service performance.
            </p>
            <ul className="m1-s360-list">
              {SERVICE360_ACCOUNTABILITY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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

      <section className="m1-section m1-section--ink m1-service-cta">
        <div className="m1-wrap m1-service-cta__inner">
          <div>
            <p className="m1-label m1-label--light">Explore the platform</p>
            <h2 className="m1-h2 m1-h2--light">
              Discover Service360
              <br />
              <em>in action.</em>
            </h2>
          </div>
          <div className="m1-service-cta__actions">
            <a
              href={SERVICE360_URL}
              className="m1-btn m1-btn--light m1-btn--lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              service360.com.au
            </a>
            <Link
              href={buildContactUrl("service360")}
              className="m1-btn m1-btn--line m1-btn--lg m1-btn--line-light"
            >
              Contact Servicelink
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
