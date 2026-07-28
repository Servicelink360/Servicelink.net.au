import Link from "next/link";
import { legalLinks } from "@/lib/legal";
import { getPublishedServices } from "@/lib/services";
import { CERTIFICATIONS } from "./data";
import { NewsletterSignup } from "./NewsletterSignup";

export async function SiteFooter() {
  const services = await getPublishedServices();

  return (
    <footer className="sl-footer">
      <div className="sl-container sl-footer__grid">
        <div className="sl-footer__brand">
          <p className="sl-footer__name">Servicelink</p>
          <p className="sl-footer__tagline">
            Integrated facilities management for organisations that demand more.
          </p>
        </div>

        <div className="sl-footer__col">
          <p className="sl-footer__heading">Services</p>
          {services.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`}>
              {service.title}
            </Link>
          ))}
        </div>

        <div className="sl-footer__col">
          <p className="sl-footer__heading">Company</p>
          <Link href="/locations">Locations</Link>
          <Link href="/about">About Us</Link>
          <Link href="/service360">Service360</Link>
          <Link href="/news">News</Link>
          <Link href="/join">Join</Link>
          <Link href="/quote">Request a quote</Link>
          <Link href="/#work">Services</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="sl-footer__col sl-footer__col--updates">
          <NewsletterSignup source="footer" />
        </div>

        <div className="sl-footer__col">
          <p className="sl-footer__heading">Certifications</p>
          {CERTIFICATIONS.map((cert) => (
            <span key={cert}>{cert}</span>
          ))}
        </div>
      </div>

      <div className="sl-container sl-footer__bottom">
        <p>© {new Date().getFullYear()} Servicelink. All rights reserved.</p>
        <div className="sl-footer__links">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
