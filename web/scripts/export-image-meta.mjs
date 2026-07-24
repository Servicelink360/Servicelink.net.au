import postgres from "postgres";
import fs from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const sql = postgres(url);
const out = {
  sitePages: await sql`SELECT slug, settings FROM site_pages WHERE settings IS NOT NULL`,
  seoServices: await sql`SELECT slug, hero_image, card_images FROM seo_services`,
  locations: await sql`SELECT slug, type, hero_image FROM locations WHERE hero_image IS NOT NULL`,
  locationServiceImages: await sql`SELECT city_id, metro_id, seo_service_id, hero_image, card_images FROM location_service_images`,
};
fs.writeFileSync("scripts/.cache/image-meta-export.json", JSON.stringify(out, null, 2));
console.log("exported", {
  sitePages: out.sitePages.length,
  seoServices: out.seoServices.length,
  locations: out.locations.length,
  locationServiceImages: out.locationServiceImages.length,
});
await sql.end();
