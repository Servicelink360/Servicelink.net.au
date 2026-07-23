export const UPLOAD_IMAGE_ROOT = "/uploads/images";
export const SERVICE_IMAGE_ROOT = `${UPLOAD_IMAGE_ROOT}/services`;
export const SITE_IMAGE_ROOT = `${UPLOAD_IMAGE_ROOT}/site`;
export const PLACEHOLDER_IMAGE = `${UPLOAD_IMAGE_ROOT}/placeholder.svg`;

export function serviceHeroPath(slug: string) {
  return `${SERVICE_IMAGE_ROOT}/${slug}/hero.jpg`;
}

export function serviceCardPaths(slug: string, count = 3) {
  return Array.from({ length: count }, (_, index) => {
    return `${SERVICE_IMAGE_ROOT}/${slug}/card-${index + 1}.jpg`;
  });
}

export function locationHeroPath(citySlug: string) {
  return `${UPLOAD_IMAGE_ROOT}/locations/${citySlug}/hero.jpg`;
}

export function isInternalImagePath(value: string) {
  const trimmed = value.trim();
  return (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/logo/")
  );
}
