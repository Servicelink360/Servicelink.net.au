import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { siteFaqs } from "@/lib/faq";
import { getFaqPageJsonLd } from "@/lib/seo";
import { getPublishedServices } from "@/lib/services";
import type { HomepageSettings } from "@/lib/homepage";
import { COMPANY_STATS } from "./data";
import { SiteFAQ } from "./SiteFAQ";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { SiteServiceCard } from "./SiteServiceCard";
import { Service360OpsMetrics } from "./Service360OpsMetrics";
import { formatSitesBadge, getService360OpsStats } from "@/lib/service360-ops";
import { getPublishedClientFeedback } from "@/lib/client-feedback-settings";
import { ClientFeedbackCarousel } from "./ClientFeedbackCarousel";

const TICKER = [
  "Facilities Management",
  "Asset Management",
  "Cleaning",
  "Grounds",
  "Tree Services",
  "Maintenance",
  "Roof & Solar",
  "24/7 Response",
  "Service360",
];

const CAPABILITIES = [
  {
    id: "01",
    title: "Technical Services",
    body: "HVAC, electrical, plumbing, fire systems, and lift maintenance — delivered through planned programmes and 24/7 reactive capability.",
    tags: ["BMS integration", "Predictive maintenance", "Trade coordination"],
  },
  {
    id: "02",
    title: "Workplace Experience",
    body: "Cleaning, concierge, security, and front-of-house services that shape how occupants experience your buildings every day.",
    tags: ["ISO cleaning standards", "Occupant feedback", "Flexible staffing"],
  },
  {
    id: "03",
    title: "Outdoor & Environment",
    body: "Grounds, landscaping, arboriculture, and waste management with sustainability metrics built into every contract.",
    tags: ["Green Star alignment", "Water-sensitive design", "Native planting"],
  },
  {
    id: "04",
    title: "Compliance & Risk",
    body: "Audit-ready documentation, contractor credentialing, WHS programmes, and regulatory reporting — always current, never scrambling.",
    tags: ["Digital audit trails", "Credential alerts", "Legislative updates"],
  },
];

type HomePageProps = {
  settings: HomepageSettings;
};

export default async function HomePage({ settings }: HomePageProps) {
  const services = await getPublishedServices();
  const opsStats = await getService360OpsStats();
  const sitesLabel = formatSitesBadge(opsStats.sitesCount);
  const clientFeedback = await getPublishedClientFeedback();
  const companyStats = COMPANY_STATS.map((stat) =>
    stat.label === "Sites under management" && opsStats.sitesCount > 0
      ? {
          ...stat,
          value: sitesLabel,
          detail: "Live from Service360",
        }
      : stat,
  ).filter(
    (stat) =>
      !(stat.label === "Sites under management" && opsStats.sitesCount <= 0),
  );

  return (
    <>
      <JsonLd data={getFaqPageJsonLd(siteFaqs)} />
      <SiteNav />

      {/* ── Hero: asymmetric split ── */}
      <section className="m1-hero">
        <div className="m1-wrap m1-hero__grid">
          <div className="m1-hero__copy">
            <div className="m1-kicker">
              <span className="m1-kicker__line" />
              {settings.heroKicker}
            </div>
            <h1 className="m1-h1">
              {settings.heroTitleLine1}
              <br />
              <em>{settings.heroTitleLine2}</em>
            </h1>
            <p className="m1-hero__sub">{settings.heroSubtitle}</p>
            <div className="m1-hero__actions">
              <Link href="/contact" className="m1-btn m1-btn--ink m1-btn--lg">
                Start a conversation
              </Link>
              <a href="#capabilities" className="m1-btn m1-btn--line m1-btn--lg">
                View capabilities
              </a>
            </div>
            <dl className="m1-hero__mini">
              <div>
                <dt>Founded</dt>
                <dd>2018</dd>
              </div>
              <div>
                <dt>Headquarters</dt>
                <dd>Sydney, AU</dd>
              </div>
              <div>
                <dt>Certified</dt>
                <dd>ISO Triple</dd>
              </div>
            </dl>
          </div>

          <div className="m1-hero__visual">
            <div className="m1-hero__frame m1-hero__frame--main">
              <Image
                src={settings.heroMainImage}
                alt="Modern commercial building exterior"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
            <div className="m1-hero__frame m1-hero__frame--float">
              <Image
                src={settings.heroAccentImage}
                alt="Office facility interior"
                fill
                className="object-cover"
                sizes="280px"
              />
              <div className="m1-hero__stat-card">
                <span className="m1-hero__stat-n">
                  {opsStats.sitesCount > 0 ? sitesLabel : settings.statNumber}
                </span>
                <span className="m1-hero__stat-l">{settings.statLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="work" className="m1-section m1-section--work-top">
        <div className="m1-wrap m1-section-top m1-reveal">
          <p className="m1-label">Our services</p>
          <h2 className="m1-h2">Our Services</h2>
        </div>

        <div className="m1-wrap">
          <div className="m1-cases">
            {services.map((service) => (
              <SiteServiceCard
                key={service.slug}
                service={service}
                className="m1-reveal"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Service360 teaser ── */}
      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-s360-teaser m1-reveal">
          <div>
            <p className="m1-label">Platform</p>
            <h2 className="m1-h2">
              Service360
              <br />
              <em>portfolio control.</em>
            </h2>
            <p className="m1-s360-teaser__text">
              Built by Servicelink to manage our facilities and asset operations
              across {sitesLabel === "0" ? "our" : `${sitesLabel}`} active sites —
              covering facilities management, asset management, cleaning,
              grounds, maintenance and support services. Clients, facility
              managers and field teams work in one system, with live oversight of
              site condition, asset history, programmed works, reactive faults
              and proof of completed service.
            </p>
            <Service360OpsMetrics stats={opsStats} />
          </div>
          <div className="m1-s360-teaser__actions">
            <Link href="/service360" className="m1-btn m1-btn--ink m1-btn--lg">
              Explore Service360
            </Link>
            <a
              href="https://service360.com.au/"
              className="m1-btn m1-btn--line m1-btn--lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit platform
            </a>
          </div>
        </div>
      </section>

      {/* ── Capabilities: numbered list ── */}
      <section id="capabilities" className="m1-section">
        <div className="m1-wrap">
          <div className="m1-cap-list">
            {CAPABILITIES.map((cap) => (
              <article key={cap.id} className="m1-cap m1-reveal">
                  <span className="m1-cap__id">{cap.id}</span>
                  <div className="m1-cap__body">
                    <h3 className="m1-cap__title">{cap.title}</h3>
                    <p className="m1-cap__text">{cap.body}</p>
                    <ul className="m1-cap__tags">
                      {cap.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                  <span className="m1-cap__arrow" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4 10h12M11 5l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
              </article>
            ))}
          </div>

          <div className="m1-section-top m1-section-top--below m1-reveal">
            <p className="m1-label">Capabilities</p>
            <h2 className="m1-h2">
              Everything your portfolio needs.
              <br />
              Nothing it doesn&apos;t.
            </h2>
          </div>
        </div>
      </section>

      {/* ── Services marquee ── */}
      <div className="sl-page m1-marquee">
        <section className="sl-marquee-band" aria-label="End-to-end facilities capability">
          <div className="sl-container">
            <p className="sl-marquee-band__label">End-to-end facilities capability</p>
          </div>
          <div className="sl-marquee">
            <div className="sl-marquee__track">
              {[...TICKER, ...TICKER].map((word, i) => (
                <span key={`${word}-${i}`} className="sl-marquee__item">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="sl-stats" aria-label="Key performance figures">
          <div className="sl-container">
            <div className="sl-stats__grid">
              {companyStats.map((stat) => (
                <article key={stat.label} className="sl-stat m1-reveal">
                  <p className="sl-stat__value">{stat.value}</p>
                  <p className="sl-stat__label">{stat.label}</p>
                  <p className="sl-stat__detail">{stat.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Client feedback ── */}
      {clientFeedback.length > 0 ? (
        <section className="m1-section m1-section--stone" aria-label="Client feedback">
          <div className="m1-wrap">
            <div className="m1-section-top m1-reveal">
              <div>
                <p className="m1-label">Feedback</p>
                <h2 className="m1-h2">
                  Trusted by the people
                  <br />
                  <em>who run the buildings.</em>
                </h2>
              </div>
            </div>

            <ClientFeedbackCarousel items={clientFeedback} />
          </div>
        </section>
      ) : null}

      {/* ── FAQ ── */}
      <section className="m1-section">
        <div className="m1-wrap m1-faq-wrap">
          <div className="m1-reveal">
            <p className="m1-label">FAQ</p>
            <h2 className="m1-h2">Common questions</h2>
          </div>
          <SiteFAQ />
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
