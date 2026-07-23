export const SERVICE_IMAGE_ROOT = "/uploads/images/services";

export function serviceHeroPath(slug) {
  return `${SERVICE_IMAGE_ROOT}/${slug}/hero.jpg`;
}

export function serviceCardPaths(slug, count = 3) {
  return Array.from({ length: count }, (_, index) => {
    return `${SERVICE_IMAGE_ROOT}/${slug}/card-${index + 1}.jpg`;
  });
}

export function buildDefaultServiceImages(slugs) {
  return Object.fromEntries(
    slugs.map((slug) => [
      slug,
      {
        hero: serviceHeroPath(slug),
        cards: serviceCardPaths(slug),
      },
    ]),
  );
}
