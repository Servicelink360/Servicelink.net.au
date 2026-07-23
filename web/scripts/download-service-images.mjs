import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const servicesRoot = path.join(publicDir, "uploads", "images", "services");

/** Unsplash photos — downloaded once and stored locally only. */
const serviceImages = {
  "facilities-management": {
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  "general-cleaning": {
    hero: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  "ground-maintenance": {
    hero: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  "tree-lopping-and-trees-assessments": {
    hero: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  "maintenance-services": {
    hero: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  "asset-management": {
    hero: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=85&auto=format&fit=crop",
    ],
  },
  "support-services": {
    hero: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=85&auto=format&fit=crop",
    cards: [
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=85&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&q=85&auto=format&fit=crop",
    ],
  },
};

async function downloadImage(url, targetPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ServicelinkSiteSetup/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, buffer);
}

function internalPath(slug, filename) {
  return `/uploads/images/services/${slug}/${filename}`;
}

const url = process.env.DATABASE_URL;
const sql = url ? postgres(url) : null;

const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const onlySlug = onlyArg?.split("=")[1];
const entries = Object.entries(serviceImages).filter(
  ([slug]) => !onlySlug || slug === onlySlug,
);

if (onlySlug && entries.length === 0) {
  console.error(`Unknown service slug for --only: ${onlySlug}`);
  process.exit(1);
}

for (const [slug, images] of entries) {
  const serviceDir = path.join(servicesRoot, slug);
  await fs.mkdir(serviceDir, { recursive: true });

  const heroFile = path.join(serviceDir, "hero.jpg");
  const heroPath = internalPath(slug, "hero.jpg");
  console.log(`Downloading hero for ${slug}...`);
  await downloadImage(images.hero, heroFile);

  const cardPaths = [];
  for (let index = 0; index < images.cards.length; index++) {
    const filename = `card-${index + 1}.jpg`;
    const cardFile = path.join(serviceDir, filename);
    console.log(`Downloading ${filename} for ${slug}...`);
    await downloadImage(images.cards[index], cardFile);
    cardPaths.push(internalPath(slug, filename));
  }

  if (sql) {
    await sql`
      UPDATE seo_services
      SET
        hero_image = ${heroPath},
        card_images = ${JSON.stringify(cardPaths)}
      WHERE linked_service_slug = ${slug}
         OR slug = ${slug}
    `;
  }

  console.log(`Saved ${slug}: ${heroPath} + ${cardPaths.length} cards`);
}

if (sql) {
  await sql.end();
}

console.log("Service images downloaded and database updated.");
