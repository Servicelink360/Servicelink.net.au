export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How ServiceLink Pty Ltd collects, uses, and protects your personal information.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Introduction",
        paragraphs: [
          "ServiceLink Pty Ltd (ABN 77 624 079 698) trading as Servicelink Facilities Management (\"we\", \"us\", \"our\") respects your privacy and is committed to protecting personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).",
          "This policy explains how we collect, use, disclose, and store personal information when you visit our website, contact us, or use our facilities management services.",
        ],
      },
      {
        title: "Information we collect",
        paragraphs: [
          "We may collect personal information such as your name, email address, phone number, organisation, job title, and any details you provide in enquiry or contact forms.",
          "We may also collect technical information when you use our website, including browser type, device information, pages visited, and general usage data through server logs.",
        ],
      },
      {
        title: "How we use your information",
        paragraphs: [
          "We use personal information to respond to enquiries, provide quotes and services, manage client relationships, improve our website, comply with legal obligations, and communicate with you about our services.",
          "We do not sell your personal information to third parties.",
        ],
      },
      {
        title: "Disclosure of information",
        paragraphs: [
          "We may disclose personal information to service providers who assist us in operating our business (such as hosting, email, or IT support), where required by law, or with your consent.",
          "We take reasonable steps to ensure third parties handle personal information in line with applicable privacy laws.",
        ],
      },
      {
        title: "Cookies and similar technologies",
        paragraphs: [
          "Our website may use cookies and similar technologies to help the site function, understand usage, and improve your experience. For more detail, see our Cookie Policy.",
        ],
      },
      {
        title: "Security and retention",
        paragraphs: [
          "We implement reasonable technical and organisational measures to protect personal information from misuse, loss, unauthorised access, modification, or disclosure.",
          "We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, unless a longer retention period is required by law.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          "You may request access to, or correction of, personal information we hold about you by contacting us using the details below.",
          "If you believe we have breached the APPs, you may lodge a complaint with us. If unresolved, you may contact the Office of the Australian Information Commissioner (OAIC).",
        ],
      },
      {
        title: "Contact us",
        paragraphs: [
          "For privacy enquiries, contact helpdesk@servicelink.net.au or call 0420 220 220.",
        ],
      },
    ],
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    description:
      "Terms governing use of the Servicelink Facilities Management website.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "Acceptance of terms",
        paragraphs: [
          "By accessing and using this website, you agree to these Terms & Conditions. If you do not agree, you should not use this website.",
          "We may update these terms from time to time. Continued use of the website after changes are published constitutes acceptance of the updated terms.",
        ],
      },
      {
        title: "Website use",
        paragraphs: [
          "You must use this website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the website.",
          "You must not attempt to gain unauthorised access to our systems, introduce malicious code, or use the website in any manner that could damage or impair its operation.",
        ],
      },
      {
        title: "Information on this website",
        paragraphs: [
          "Content on this website is provided for general information purposes only. While we endeavour to keep information accurate and up to date, we make no warranties about completeness, reliability, or suitability for any particular purpose.",
          "Service descriptions, capabilities, and availability may change without notice.",
        ],
      },
      {
        title: "Enquiries and contracts",
        paragraphs: [
          "Submitting a contact form or enquiry does not create a binding contract. Any facilities management services are subject to separate written agreement, scope of works, and commercial terms agreed between the parties.",
        ],
      },
      {
        title: "Intellectual property",
        paragraphs: [
          "Unless otherwise stated, all content on this website — including text, graphics, logos, and layout — is owned by or licensed to ServiceLink Pty Ltd and is protected by Australian intellectual property laws.",
          "Images and media on this website may be owned by us, licensed from third parties, or used under applicable licence terms. You may not reproduce, distribute, or modify website content without our prior written consent.",
          "Website images are generally for display and illustration only and should not be treated as a depiction of a specific contracted site or outcome unless we say so.",
        ],
      },
      {
        title: "Limitation of liability",
        paragraphs: [
          "To the maximum extent permitted by law, ServiceLink Pty Ltd is not liable for any loss or damage arising from your use of, or reliance on, this website or its content.",
          "Nothing in these terms excludes, restricts, or modifies any consumer guarantee or other right that cannot be excluded under the Australian Consumer Law.",
        ],
      },
      {
        title: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of New South Wales, Australia. You submit to the non-exclusive jurisdiction of the courts of New South Wales.",
        ],
      },
    ],
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    description:
      "Important limitations regarding information published on this website.",
    lastUpdated: "23 June 2026",
    sections: [
      {
        title: "General disclaimer",
        paragraphs: [
          "The information on this website is published by ServiceLink Pty Ltd trading as Servicelink Facilities Management for general guidance only.",
          "It is not professional, legal, financial, or technical advice. You should seek appropriate advice before acting on any information contained on this site.",
        ],
      },
      {
        title: "No warranty",
        paragraphs: [
          "We make no representation or warranty that the website will be uninterrupted, error-free, or free from viruses or other harmful components.",
          "We do not guarantee that information on the website is complete, current, or accurate at all times.",
        ],
      },
      {
        title: "Images and visual content",
        paragraphs: [
          "Photographs, illustrations, icons, and other visual content on this website are provided for general display and illustrative purposes only.",
          "Images may depict representative facilities, environments, or activities and do not necessarily show a specific Servicelink client site, current project, or guaranteed service outcome unless expressly stated.",
          "Any resemblance to particular properties or people is coincidental unless we identify them as such. Visuals may be stock imagery, commissioned photography, or edited for presentation.",
        ],
      },
      {
        title: "Third-party references",
        paragraphs: [
          "References to clients, certifications, standards, or industry bodies are provided for informational purposes. Inclusion on this website does not constitute endorsement by those organisations unless expressly stated.",
        ],
      },
      {
        title: "External links",
        paragraphs: [
          "This website may contain links to external websites. We are not responsible for the content, privacy practices, or availability of third-party sites.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "If you have questions about this disclaimer, contact helpdesk@servicelink.net.au.",
        ],
      },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description:
      "How Servicelink uses cookies and similar technologies on this website.",
    lastUpdated: "28 July 2026",
    sections: [
      {
        title: "What are cookies?",
        paragraphs: [
          "Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, remember preferences, and help site owners understand how pages are used.",
          "Similar technologies may include local storage, pixels, and server logs that collect technical information about your browser or device.",
        ],
      },
      {
        title: "How we use cookies",
        paragraphs: [
          "We may use cookies and similar technologies for essential site functions, performance measurement, and (where used) limited marketing measurement, as described below.",
        ],
      },
      {
        title: "Essential / functional",
        paragraphs: [
          "These help the website operate securely and correctly — for example, page navigation, form submission, load balancing, and remembering basic session state where required.",
        ],
      },
      {
        title: "Analytics and performance",
        paragraphs: [
          "We may use analytics tools to understand how visitors use our site (such as pages viewed, approximate location at a city or region level, device type, and referral source). This helps us improve content and performance.",
          "Where analytics providers process data on our behalf, they do so under appropriate arrangements and applicable privacy laws.",
        ],
      },
      {
        title: "Marketing and preferences",
        paragraphs: [
          "If we use marketing or preference cookies in future (for example to measure campaign performance), we will update this policy. We do not use cookies to sell your personal information.",
        ],
      },
      {
        title: "Managing cookies",
        paragraphs: [
          "Most browsers let you block or delete cookies through their settings. If you disable cookies, some parts of the website may not work as intended.",
          "You can also use browser privacy controls and, where available, opt-out tools provided by analytics or advertising networks.",
        ],
      },
      {
        title: "More information",
        paragraphs: [
          "Personal information collected via cookies or similar technologies is handled in line with our Privacy Policy.",
          "For questions about this Cookie Policy, contact helpdesk@servicelink.net.au or call 0420 220 220.",
        ],
      },
    ],
  },
];

export const legalLinks = [
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/cookie-policy", label: "Cookies" },
  { href: "/legal/terms-and-conditions", label: "Terms" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return legalPages.find((page) => page.slug === slug);
}
