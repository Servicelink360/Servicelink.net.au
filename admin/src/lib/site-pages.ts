export const HOME_PAGE_SLUG = "home";
export const SERVICE360_PAGE_SLUG = "service360";

export const SYSTEM_SITE_PAGES = [
  { slug: "home", title: "Homepage", pageType: "homepage", publicPath: "/" },
  { slug: "service360", title: "Service360", pageType: "service360", publicPath: "/service360" },
  { slug: "about", title: "About Us", pageType: "template", publicPath: "/about" },
  { slug: "services", title: "Services", pageType: "template", publicPath: "/services" },
  { slug: "contact", title: "Contact", pageType: "template", publicPath: "/contact" },
  { slug: "quote", title: "Request a Quote", pageType: "template", publicPath: "/quote" },
  { slug: "join", title: "Join", pageType: "template", publicPath: "/join" },
] as const;

export type SitePageType = "standard" | "homepage" | "template" | "service360";

export function isSystemSitePageSlug(slug: string) {
  return SYSTEM_SITE_PAGES.some((page) => page.slug === slug);
}

export function getSystemSitePagePublicPath(slug: string) {
  return SYSTEM_SITE_PAGES.find((page) => page.slug === slug)?.publicPath ?? null;
}

export function formatSitePageType(pageType: string) {
  switch (pageType) {
    case "homepage":
      return "Homepage";
    case "service360":
      return "Service360 page";
    case "template":
      return "Site template";
    default:
      return "Custom page";
  }
}
