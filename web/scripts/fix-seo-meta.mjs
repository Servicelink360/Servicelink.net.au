/**
 * One-off / deploy helper: normalise SEO meta titles and long city-hub descriptions.
 *
 * - Strip trailing "| Servicelink" from meta_title (brand is added at render time)
 * - Rewrite template-style city_hub meta descriptions to a shorter SERP-friendly form
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

function stripTrailingBrand(title) {
  return String(title || "")
    .replace(/(\s*\|\s*Servicelink)+$/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(text, max = 155) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  const sliced = value.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const base = lastSpace > Math.floor(max * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${base.replace(/[.,;:\s]+$/g, "")}…`;
}

function cityHubDescription(cityName, state) {
  return clamp(
    `Facilities management, cleaning, maintenance, and support services for businesses across ${cityName}, ${state} and nearby metro areas.`,
  );
}

const rows = await sql`
  select id, page_type, path, meta_title, meta_description, city_id
  from seo_pages
`;

const cities = await sql`select id, name, state from locations where type = 'city'`;
const cityById = new Map(cities.map((c) => [c.id, c]));

let titleUpdates = 0;
let descUpdates = 0;

for (const row of rows) {
  const nextTitle = stripTrailingBrand(row.meta_title);
  let nextDesc = row.meta_description;

  if (row.page_type === "city_hub") {
    const city = cityById.get(row.city_id);
    if (city) {
      nextDesc = cityHubDescription(city.name, city.state);
    }
  }

  const titleChanged = nextTitle !== (row.meta_title || "").trim();
  const descChanged = nextDesc !== row.meta_description;

  if (!titleChanged && !descChanged) continue;

  await sql`
    update seo_pages
    set
      meta_title = ${nextTitle},
      meta_description = ${nextDesc},
      updated_at = now()
    where id = ${row.id}
  `;

  if (titleChanged) titleUpdates += 1;
  if (descChanged) descUpdates += 1;
}

const sample = await sql`
  select path, meta_title, length(meta_title) as title_len, length(meta_description) as desc_len
  from seo_pages
  where published = true and page_type = 'city_hub'
  order by path
  limit 5
`;

console.log(
  JSON.stringify(
    {
      scanned: rows.length,
      titleUpdates,
      descUpdates,
      sample,
    },
    null,
    2,
  ),
);

await sql.end();
console.log("SEO_META_FIX_OK");
