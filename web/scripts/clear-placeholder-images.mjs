import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(url);

await sql`
  UPDATE seo_services
  SET hero_image = NULL
  WHERE hero_image LIKE 'http%'
     OR hero_image LIKE '%/uploads/images/services/%/hero.%'
`;
await sql`
  UPDATE seo_services
  SET card_images = NULL
  WHERE card_images LIKE '%http%'
     OR card_images LIKE '%/uploads/images/services/%/card-%'
`;

console.log("Cleared placeholder service image paths from seo_services.");

await sql.end();
