export const IMAGE_SPECS = {
  homepageHeroMain:
    "1920 × 1280 px (3:2 landscape). Matches the homepage large hero frame exactly — avoid borders/critical content in the bottom-right (covered by the floating inset). JPG, PNG or WebP.",
  homepageHeroAccent:
    "960 × 1200 px (4:5 portrait). Matches the small floating homepage image. JPG, PNG or WebP.",
  serviceHero:
    "1920 × 1440 px (4:3). Used on service and location page heroes. JPG, PNG or WebP.",
  service360Hero:
    "1920 × 1440 px (4:3). Used as the Service360 page hero. JPG, PNG or WebP.",
  serviceCard:
    "1920 × 720 px (wide 8:3). Used in service card sliders on the homepage and location pages. JPG, PNG or WebP.",
  locationHero:
    "1920 × 1440 px (4:3). Used for city or metro hub heroes. JPG, PNG or WebP.",
  newsFeatured:
    "1920 × 1080 px (16:9). Used as the news article header image. JPG, PNG or WebP.",
  newsPageHero:
    "1920 × 1440 px (4:3). Used as the News landing page hero. JPG, PNG or WebP.",
  seoPageHero:
    "1920 × 1440 px (4:3). Optional override for a single SEO location page. JPG, PNG or WebP.",
} as const;

export type ImageSpecKey = keyof typeof IMAGE_SPECS;

export function getImageSpec(key: ImageSpecKey) {
  return IMAGE_SPECS[key];
}
