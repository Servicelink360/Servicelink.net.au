export const IMAGE_SPECS = {
  homepageHeroMain:
    "1920 × 1280 px (3:2 landscape). Matches the homepage large hero frame exactly — avoid borders/critical content in the bottom-right (covered by the floating inset). Uploads are auto-compressed to WebP.",
  homepageHeroAccent:
    "960 × 1200 px (4:5 portrait). Matches the small floating homepage image. Uploads are auto-compressed to WebP.",
  serviceHero:
    "1920 × 1440 px (4:3). Used on service and location page heroes. Uploads are auto-compressed to WebP.",
  service360Hero:
    "1920 × 1440 px (4:3). Used as the Service360 page hero. Uploads are auto-compressed to WebP.",
  serviceCard:
    "1920 × 720 px (wide 8:3). Used in service card sliders on the homepage and location pages. Uploads are auto-compressed to WebP.",
  locationHero:
    "1920 × 1440 px (4:3). Used for city or metro hub heroes. Uploads are auto-compressed to WebP.",
  newsFeatured:
    "1920 × 1080 px (16:9). Used as the news article header image. Uploads are auto-compressed to WebP.",
  newsPageHero:
    "1920 × 1440 px (4:3). Used as the News landing page hero. Uploads are auto-compressed to WebP.",
  aboutPageHero:
    "1920 × 1440 px (4:3). Used as the About Us page hero. Prefer a real Servicelink site or team photo. Uploads are auto-compressed to WebP.",
  seoPageHero:
    "1920 × 1440 px (4:3). Optional override for a single SEO location page. Uploads are auto-compressed to WebP.",
} as const;

export type ImageSpecKey = keyof typeof IMAGE_SPECS;

export function getImageSpec(key: ImageSpecKey) {
  return IMAGE_SPECS[key];
}
