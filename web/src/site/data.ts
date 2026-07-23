import { services, type Service } from "@/lib/services";
import {
  PLACEHOLDER_IMAGE,
  serviceCardPaths,
  serviceHeroPath,
} from "@/lib/service-image-paths";

const SERVICE_SLUGS = [
  "asset-management",
  "facilities-management",
  "general-cleaning",
  "ground-maintenance",
  "tree-lopping-and-trees-assessments",
  "maintenance-services",
  "roof-gutter-solar-cleaning",
  "support-services",
] as const;

export const SERVICE_IMAGES: Record<string, string> = Object.fromEntries(
  SERVICE_SLUGS.map((slug) => [slug, serviceHeroPath(slug)]),
);

export const SERVICE_CARD_IMAGES: Record<string, string[]> = Object.fromEntries(
  SERVICE_SLUGS.map((slug) => [slug, serviceCardPaths(slug)]),
);

export const CERTIFICATIONS = [
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "WHS Compliant",
  "Green Star Partner",
];

export const COMPANY_STATS = [
  { value: "1,100+", label: "Sites under management", detail: "Across Sydney & NSW" },
  { value: "18", label: "Years of operational excellence", detail: "Since 2006" },
  { value: "99.2%", label: "SLA compliance rate", detail: "Rolling 12 months" },
  { value: "24/7", label: "Emergency response", detail: "365 days a year" },
];

export const ABOUT_VALUES = [
  {
    title: "Customer focus",
    text: "We listen, adapt, and deliver service that fits how your business actually operates.",
  },
  {
    title: "Integrity",
    text: "Transparent reporting, honest communication, and accountability you can rely on.",
  },
  {
    title: "Innovation",
    text: "Modern tools and proactive maintenance — fixing issues before they become problems.",
  },
  {
    title: "Excellence",
    text: "Documented standards, qualified teams, and a commitment to getting the details right.",
  },
  {
    title: "Sustainability",
    text: "Responsible practices that reduce waste and support healthier workplaces.",
  },
  {
    title: "Partnership",
    text: "Built for long-term relationships — not one-off contracts or handover headaches.",
  },
];

export type ServiceCardMeta = {
  tag: string;
  subtitle: string;
};

export const SERVICE_CARD_META: Record<string, ServiceCardMeta> = {
  "facilities-management": {
    tag: "One partner",
    subtitle: "Offices, retail & multi-site portfolios",
  },
  "general-cleaning": {
    tag: "Audit-ready",
    subtitle: "Workplaces & commercial sites",
  },
  "ground-maintenance": {
    tag: "Year-round",
    subtitle: "Commercial & industrial sites",
  },
  "tree-lopping-and-trees-assessments": {
    tag: "Qualified crews",
    subtitle: "Commercial & industrial properties",
  },
  "maintenance-services": {
    tag: "24/7 response",
    subtitle: "When downtime is not an option",
  },
  "asset-management": {
    tag: "Data-driven",
    subtitle: "Registers, lifecycle & compliance",
  },
  "support-services": {
    tag: "Single point",
    subtitle: "Procurement, projects & helpdesk",
  },
  "roof-gutter-solar-cleaning": {
    tag: "Height-safe",
    subtitle: "Roofs, gutters & solar arrays",
  },
};

export function getServiceCardMeta(slug: string): ServiceCardMeta {
  return (
    SERVICE_CARD_META[slug] ?? {
      tag: "Servicelink",
      subtitle: "Commercial & industrial sites",
    }
  );
}

export function getServiceImage(slug: string): string {
  return SERVICE_IMAGES[slug] ?? PLACEHOLDER_IMAGE;
}

export function getServiceCardImages(slug: string): string[] {
  const images = SERVICE_CARD_IMAGES[slug];
  if (images?.length) return images;
  return [PLACEHOLDER_IMAGE];
}

export async function getRelatedServices(slug: string, count = 3): Promise<Service[]> {
  const { getPublishedServices } = await import("@/lib/services");
  const published = await getPublishedServices();
  const index = published.findIndex((service) => service.slug === slug);
  if (index === -1) return published.slice(0, count);

  const related: Service[] = [];
  for (let i = 1; i <= published.length && related.length < count; i++) {
    const service = published[(index + i) % published.length];
    if (service.slug !== slug) related.push(service);
  }
  return related;
}
