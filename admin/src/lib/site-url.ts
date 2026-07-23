export function getPublicSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function publicLocationPageUrl(path: string) {
  return `${getPublicSiteUrl()}/locations/${path}`;
}
