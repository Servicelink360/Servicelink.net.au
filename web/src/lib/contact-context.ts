export type ContactReferrer = {
  key: string;
  path: string;
  breadcrumbLabel: string;
  label: string;
  titleLine1: string;
  titleEmphasis: string;
  summary: string;
  source: string;
  messagePlaceholder: string;
};

const CONTACT_REFERRERS = {
  about: {
    key: "about",
    path: "/about",
    breadcrumbLabel: "About Us",
    label: "Contact Servicelink",
    titleLine1: "Let's continue the",
    titleEmphasis: "conversation.",
    summary:
      "You've learned about Servicelink — now tell us about your facilities and we'll schedule a tailored briefing within one business day.",
    source: "contact-about",
    messagePlaceholder:
      "Tell us about your portfolio and how we can partner on facilities...",
  },
  service360: {
    key: "service360",
    path: "/service360",
    breadcrumbLabel: "Service360",
    label: "Contact Servicelink",
    titleLine1: "See Service360",
    titleEmphasis: "for your sites.",
    summary:
      "Tell us about your portfolio and we’ll show how Service360 gives you visibility across every site, task and report.",
    source: "contact-service360",
    messagePlaceholder:
      "Tell us about your sites and what visibility you need from Service360...",
  },
} as const satisfies Record<string, ContactReferrer>;

export type ContactReferrerKey = keyof typeof CONTACT_REFERRERS;

export function buildContactUrl(from: ContactReferrerKey): string {
  return `/contact?from=${from}`;
}

export function getContactPageContext(from?: string): ContactReferrer | null {
  if (!from || !(from in CONTACT_REFERRERS)) {
    return null;
  }

  return CONTACT_REFERRERS[from as ContactReferrerKey];
}
