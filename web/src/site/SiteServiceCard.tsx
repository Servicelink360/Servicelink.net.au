import Link from "next/link";
import type { Service } from "@/lib/services";
import { getServiceDisplayImages } from "@/lib/service-display-images";
import { getServiceCardMeta } from "./data";
import { SiteServiceCardImageSlider } from "./SiteServiceCardImageSlider";

type SiteServiceCardProps = {
  service: Service;
  className?: string;
};

export async function SiteServiceCard({ service, className = "" }: SiteServiceCardProps) {
  const meta = getServiceCardMeta(service.slug);
  const images = await getServiceDisplayImages(service.slug);

  return (
    <article className={`m1-case ${className}`.trim()}>
      <SiteServiceCardImageSlider images={images.cardImages} alt={service.title} />

      <Link href={`/services/${service.slug}`} className="m1-case__link">
        <div className="m1-case__body">
          <div className="m1-case__meta">
            <span className="m1-case__meta-name">{service.title}</span>
            <span className="m1-case__result">{meta.tag}</span>
          </div>
          <h3 className="m1-case__title">{meta.subtitle}</h3>
          <p className="m1-case__detail">{service.description}</p>
          <span className="m1-case__more">
            <span className="m1-case__more-label">View More</span>
            <span className="m1-case__more-icon" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
