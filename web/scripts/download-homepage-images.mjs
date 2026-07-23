import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { defaultHomepageSettings, HOME_PAGE_SLUG } from "./data/system-site-pages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(__dirname, "../public/uploads/images/site");

const homepageImages = {
  "hero-main.jpg": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85&auto=format&fit=crop",
  "hero-accent.jpg": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=85&auto=format&fit=crop",
};

async function downloadImage(url, targetPath) {
  const response = await fetch(url, {
    headers: { "User-Agent": "ServicelinkSiteSetup/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buffer);
}

const url = process.env.DATABASE_URL;
const sql = url ? postgres(url) : null;

await fs.mkdir(siteDir, { recursive: true });

const imagePaths = {
  heroMainImage: "/uploads/images/site/hero-main.jpg",
  heroAccentImage: "/uploads/images/site/hero-accent.jpg",
};

for (const [filename, sourceUrl] of Object.entries(homepageImages)) {
  const targetPath = path.join(siteDir, filename);
  console.log(`Downloading ${filename}...`);
  await downloadImage(sourceUrl, targetPath);
}

if (sql) {
  const [existingPage] = await sql`
    SELECT settings FROM site_pages WHERE slug = ${HOME_PAGE_SLUG} LIMIT 1
  `;

  let current = defaultHomepageSettings;
  if (existingPage?.settings) {
    try {
      current = { ...defaultHomepageSettings, ...JSON.parse(existingPage.settings) };
    } catch {
      current = defaultHomepageSettings;
    }
  }

  const nextSettings = {
    ...current,
    ...imagePaths,
  };

  await sql`
    UPDATE site_pages
    SET settings = ${JSON.stringify(nextSettings)}, updated_at = now()
    WHERE slug = ${HOME_PAGE_SLUG}
  `;

  await sql.end();
}

console.log("Homepage images downloaded to /uploads/images/site/");
