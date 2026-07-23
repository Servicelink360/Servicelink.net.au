export const HOME_PAGE_SLUG = "home";

export const SYSTEM_SITE_PAGES = [
  { slug: "home", title: "Homepage", pageType: "homepage", publicPath: "/" },
  { slug: "service360", title: "Service360", pageType: "service360", publicPath: "/service360" },
  { slug: "about", title: "About Us", pageType: "template", publicPath: "/about" },
  { slug: "services", title: "Services", pageType: "template", publicPath: "/services" },
  { slug: "contact", title: "Contact", pageType: "template", publicPath: "/contact" },
  { slug: "quote", title: "Request a Quote", pageType: "template", publicPath: "/quote" },
  { slug: "join", title: "Join", pageType: "template", publicPath: "/join" },
];

export const defaultService360Settings = {
  heroImage: "/uploads/images/services/facilities-management/hero.jpg",
  heroKicker: "Platform",
  heroTitleLine1: "Service360",
  heroTitleLine2: "every site.",
  heroSummary:
    "The technology powering every Servicelink service. One platform. Every site. Complete operational visibility.",
  badgeNumber: "370+",
  badgeLabel: "Active sites",
};

export const defaultHomepageSettings = {
  heroMainImage: "/uploads/images/site/hero-main.jpg",
  heroAccentImage: "/uploads/images/site/hero-accent.jpg",
  heroKicker: "Your Partner in Facilities",
  heroTitleLine1: "Your buildings.",
  heroTitleLine2: "Our obsession.",
  heroSubtitle:
    "Servicelink delivers end-to-end facility operations for organisations that refuse to compromise — one partner, total accountability, measurable performance.",
  statNumber: "340+",
  statLabel: "Active sites managed across Australia",
};
