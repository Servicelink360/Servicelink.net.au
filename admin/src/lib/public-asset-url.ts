/** Resolve stored image paths for previews in the admin app (same origin via /api/media). */
export function resolvePublicAssetUrl(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/logo/")
  ) {
    const normalized = trimmed.replace(/^\/+/, "");
    return `/api/media/${normalized}`;
  }

  if (trimmed.startsWith("/")) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
    if (siteUrl) {
      return `${siteUrl}${trimmed}`;
    }
  }

  return trimmed;
}
