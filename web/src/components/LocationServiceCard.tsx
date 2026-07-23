import Link from "next/link";
import type { SeoPageLink } from "@/lib/seo-content";
import { seoPageUrl } from "@/lib/seo-content";
import { getServiceCardImages, getServiceCardMeta } from "@/site/data";
import { SiteServiceCardImageSlider } from "@/site/SiteServiceCardImageSlider";

type LocationServiceCardProps = {
  item: SeoPageLink;
  className?: string;
};

export function LocationServiceCard({ item, className = "" }: LocationServiceCardProps) {
  const imageSlug = item.linkedServiceSlug ?? "facilities-management";
  const meta = getServiceCardMeta(imageSlug);
  const images =
    item.cardImages && item.cardImages.length > 0
      ? item.cardImages
      : getServiceCardImages(imageSlug);
  const serviceName = item.serviceName ?? item.h1;

  return (
    <article className={`m1-case ${className}`.trim()}>
      <SiteServiceCardImageSlider images={images} alt={item.h1} />

      <Link href={seoPageUrl(item.path)} className="m1-case__link">
        <div className="m1-case__body">
          <div className="m1-case__meta">
            <span className="m1-case__meta-name">{serviceName}</span>
            <span className="m1-case__result">{meta.tag}</span>
          </div>
          <h3 className="m1-case__title">{item.h1}</h3>
          <p className="m1-case__detail">{item.metaDescription}</p>
          <span className="m1-case__more">
            <span className="m1-case__more-label">View local page</span>
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
