export const IMAGE_SPECS = {
  homepageHeroMain:
    "1920 × 1280 px (3:2 landscape). Matches the homepage large hero frame exactly — avoid borders/critical content in the bottom-right (covered by the floating inset). Auto-compressed to WebP ≤150 KB.",
  homepageHeroAccent:
    "960 × 1200 px (4:5 portrait). Matches the small floating homepage image. Auto-compressed to WebP ≤150 KB.",
  serviceHero:
    "1920 × 1440 px (4:3). Used on service and location page heroes. Auto-compressed to WebP ≤150 KB.",
  service360Hero:
    "1920 × 1440 px (4:3). Used as the Service360 page hero. Auto-compressed to WebP ≤150 KB.",
  serviceCard:
    "1920 × 720 px (wide 8:3). Used in service card sliders on the homepage and location pages. Auto-compressed to WebP ≤150 KB.",
  locationHero:
    "1920 × 1440 px (4:3). Used for city or metro hub heroes. Auto-compressed to WebP ≤150 KB.",
  newsFeatured:
    "1920 × 1080 px (16:9). Used as the news article header image. Auto-compressed to WebP ≤150 KB.",
  newsPageHero:
    "1920 × 1440 px (4:3). Used as the News landing page hero. Auto-compressed to WebP ≤150 KB.",
  aboutPageHero:
    "1920 × 1440 px (4:3). Used as the About Us page hero. Prefer a real Servicelink site or team photo. Auto-compressed to WebP ≤150 KB.",
  seoPageHero:
    "1920 × 1440 px (4:3). Optional override for a single SEO location page. Auto-compressed to WebP ≤150 KB.",
} as const;

export type ImageSpecKey = keyof typeof IMAGE_SPECS;

export function getImageSpec(key: ImageSpecKey) {
  return IMAGE_SPECS[key];
}
