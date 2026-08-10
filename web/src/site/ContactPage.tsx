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
    "Contact Servicelink for facilities management enquiries, support, and general questions. We respond within one business day.",
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

            <p className="m1-label">{referrer?.label ?? "Get in touch"}</p>
            <h1 className="m1-h1 m1-service-hero__title">
              {referrer ? (
                <>
                  {referrer.titleLine1}
                  <br />
                  <em>{referrer.titleEmphasis}</em>
                </>
              ) : (
                <>
                  We&apos;re here to
                  <br />
                  <em>help.</em>
                </>
              )}
            </h1>
            <p className="m1-service-hero__summary">
              {referrer?.summary ??
                "Questions, support, or general enquiries — send us a message and our team will get back to you within one business day."}
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
                "How can we help? Include any useful details so we can respond quickly..."
              }
              referrerLabel={referrer?.breadcrumbLabel}
            />
          </div>
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
