import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { getContactPageContext } from "@/lib/contact-context";
import { site } from "@/lib/site";
import { SiteContactForm } from "./SiteContactForm";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Servicelink for facilities management enquiries, quotes, and support across Sydney and NSW.",
  path: "/contact",
});

type ContactPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { from } = await searchParams;
  const referrer = getContactPageContext(from);
  const phoneHref = site.contact.phone.replace(/\s/g, "");

  return (
    <>
      <SiteNav />

      <section className="m1-service-hero">
        <div className="m1-wrap m1-service-hero__grid m1-service-hero__grid--form">
          <div className="m1-service-hero__copy">
            <nav className="m1-service-hero__crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              {referrer ? (
                <>
                  <Link href={referrer.path}>{referrer.breadcrumbLabel}</Link>
                  <span aria-hidden>/</span>
                </>
              ) : null}
              <span>Contact</span>
            </nav>

            <p className="m1-label">{referrer?.label ?? "Contact Servicelink"}</p>
            <h1 className="m1-h1 m1-service-hero__title">
              {referrer ? (
                <>
                  {referrer.titleLine1}
                  <br />
                  <em>{referrer.titleEmphasis}</em>
                </>
              ) : (
                <>
                  Let&apos;s talk about
                  <br />
                  <em>your portfolio.</em>
                </>
              )}
            </h1>
            <p className="m1-service-hero__summary">
              {referrer?.summary ??
                "Tell us about your facilities and we'll schedule a tailored briefing within one business day — no generic proposals, just practical next steps from our Sydney team."}
            </p>

            <div className="m1-service-hero__actions">
              <a href={`tel:${phoneHref}`} className="m1-btn m1-btn--ink m1-btn--lg">
                Call {site.contact.phone}
              </a>
              <a href="#contact-form" className="m1-btn m1-btn--line m1-btn--lg">
                Contact
              </a>
            </div>
          </div>

          <div id="contact-form" className="m1-service-hero__form">
            <SiteContactForm
              source={referrer?.source ?? "contact-page"}
              variant="hero"
              messagePlaceholder={
                referrer?.messagePlaceholder ??
                "Tell us about your facilities and requirements..."
              }
              referrerLabel={referrer?.breadcrumbLabel}
            />
          </div>
        </div>
      </section>

      <section className="m1-section m1-section--stone">
        <div className="m1-wrap m1-contact-details">
          <p className="m1-label">Support office</p>
          <h2 className="m1-h2">How to reach us</h2>
          <div className="m1-contact-details__grid">
            <div>
              <span className="m1-contact-details__label">Phone</span>
              <a href={`tel:${phoneHref}`}>{site.contact.phone}</a>
            </div>
            <div>
              <span className="m1-contact-details__label">Contact</span>
              <a href="#contact-form" className="m1-btn m1-btn--ink">
                Contact
              </a>
            </div>
            <div>
              <span className="m1-contact-details__label">{site.contact.officeLabel}</span>
              <span>{site.contact.location}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
