import type { Metadata } from "next";
import type { FaqItem } from "@/lib/faq";
import { site } from "@/lib/site";

export const seo = {
  siteName: "Servicelink",
  defaultTitle: "Servicelink — Your Partner in Facilities",
  titleTemplate: "%s | Servicelink",
  description: site.description,
  locale: "en_AU",
} as const;

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
};

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  openGraphType = "website",
}: CreatePageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const pageTitle = title.includes("Servicelink") ? title : `${title} | Servicelink`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: openGraphType,
      locale: seo.locale,
      url: canonical,
      siteName: seo.siteName,
      title: pageTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
  };
}

export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: {
      default: seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.description,
    applicationName: seo.siteName,
    creator: site.name,
    publisher: site.name,
    formatDetection: {
      telephone: true,
      email: true,
    },
    alternates: {
      canonical: site.url,
    },
    icons: {
      icon: "/logo/servicelink_logo.svg",
      shortcut: "/logo/servicelink_logo.svg",
    },
    openGraph: {
      type: "website",
      locale: seo.locale,
      url: site.url,
      siteName: seo.siteName,
      title: seo.defaultTitle,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.defaultTitle,
      description: seo.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function createNoIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.contact.email,
    telephone: site.contact.phone,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "New South Wales, Australia",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sydney",
      addressRegion: "NSW",
      addressCountry: "AU",
    },
    sameAs: [site.url],
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: seo.siteName,
    url: site.url,
    description: site.description,
    publisher: {
      "@id": `${site.url}/#organization`,
    },
    inLanguage: "en-AU",
  };
}

export function getFaqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getServiceJsonLd(service: {
  title: string;
  summary: string;
  slug: string;
}) {
  const url = service.slug.includes("/")
    ? absoluteUrl(`/locations/${service.slug}`)
    : absoluteUrl(`/services/${service.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    url,
    provider: {
      "@id": `${site.url}/#organization`,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Australia",
    },
  };
}

export function getArticleJsonLd(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url: absoluteUrl(`/news/${article.slug}`),
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: site.name,
    },
    publisher: {
      "@id": `${site.url}/#organization`,
    },
    ...(article.image ? { image: article.image } : {}),
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
  };
}
