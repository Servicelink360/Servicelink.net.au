/**
 * Recompress existing public/uploads images to ≤150 KB WebP.
 *
 * Usage:
 *   node --env-file=.env scripts/compress-existing-uploads.mjs
 *   node --env-file=.env scripts/compress-existing-uploads.mjs --dry-run
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import sharp from "sharp";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const maxBytes = Number(
  args.find((a) => a.startsWith("--max-bytes="))?.split("=")[1] ?? 150 * 1024,
);
const maxEdgeStart = 1920;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "../public");
const uploadsRoot = path.join(publicDir, "uploads");

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function toPublicUrl(absPath) {
  return `/${path.relative(publicDir, absPath).replaceAll("\\", "/")}`;
}

async function encodeWebpUnderCap(input) {
  let edge = maxEdgeStart;
  let best = null;

  for (let pass = 0; pass < 8; pass += 1) {
    for (const quality of [72, 64, 56, 48, 40, 32, 24]) {
      const buffer = await sharp(input, { failOn: "none", animated: false })
        .rotate()
        .resize({
          width: edge,
          height: edge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 5, smartSubsample: true })
        .toBuffer();

      if (!best || buffer.length < best.length) best = buffer;
      if (buffer.length <= maxBytes) return buffer;
    }
    edge = Math.max(640, Math.round(edge * 0.75));
  }

  return best;
}

async function replacePathEverywhere(fromUrl, toUrl) {
  if (!sql || fromUrl === toUrl) return 0;
  let touched = 0;

  const direct = await Promise.all([
    sql`UPDATE locations SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`,
    sql`UPDATE seo_pages SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`,
    sql`UPDATE seo_services SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`,
    sql`UPDATE news_posts SET featured_image = ${toUrl} WHERE featured_image = ${fromUrl}`,
    sql`UPDATE location_service_images SET hero_image = ${toUrl} WHERE hero_image = ${fromUrl}`.catch(() => []),
  ]);
  for (const result of direct) touched += result.count ?? 0;

  const like = `%${fromUrl}%`;
  const blobs = await Promise.all([
    sql`UPDATE seo_pages SET card_images = replace(card_images, ${fromUrl}, ${toUrl}) WHERE card_images LIKE ${like}`,
    sql`UPDATE seo_services SET card_images = replace(card_images, ${fromUrl}, ${toUrl}) WHERE card_images LIKE ${like}`,
    sql`UPDATE location_service_images SET card_images = replace(card_images, ${fromUrl}, ${toUrl}) WHERE card_images LIKE ${like}`.catch(() => []),
    sql`UPDATE site_pages SET settings = replace(settings, ${fromUrl}, ${toUrl}) WHERE settings LIKE ${like}`,
    sql`UPDATE site_settings SET value = replace(value, ${fromUrl}, ${toUrl}) WHERE value LIKE ${like}`.catch(() => []),
  ]);
  for (const result of blobs) touched += result.count ?? 0;

  return touched;
}

let scanned = 0;
let skipped = 0;
let compressed = 0;
let savedBytes = 0;
let pathRewrites = 0;
let errors = 0;
let stillOver = 0;

console.log(
  `Scanning ${uploadsRoot} (cap ${maxBytes} bytes / ${(maxBytes / 1024).toFixed(0)} KB)${dryRun ? " [dry-run]" : ""}…`,
);

const files = await walk(uploadsRoot);

for (const filePath of files) {
  const ext = path.extname(filePath).toLowerCase();
  if (!RASTER.has(ext)) continue;

  scanned += 1;
  const beforeStat = await fs.stat(filePath);
  if (beforeStat.size <= maxBytes && ext === ".webp") {
    skipped += 1;
    continue;
  }

  try {
    const input = await fs.readFile(filePath);
    const output = await encodeWebpUnderCap(input);
    if (!output) {
      errors += 1;
      continue;
    }

    const fromUrl = toPublicUrl(filePath);
    const outPath =
      ext === ".webp" ? filePath : filePath.replace(/\.(png|jpe?g)$/i, ".webp");
    const outUrl = toPublicUrl(outPath);

    if (output.length >= beforeStat.size * 0.98 && outPath === filePath && beforeStat.size <= maxBytes) {
      skipped += 1;
      continue;
    }

    const delta = beforeStat.size - output.length;
    const rel = path.relative(uploadsRoot, filePath);
    const over = output.length > maxBytes ? " OVER CAP" : "";
    console.log(
      `  ${rel}: ${(beforeStat.size / 1024).toFixed(0)}KB → ${(output.length / 1024).toFixed(0)}KB${over}`,
    );
    if (output.length > maxBytes) stillOver += 1;

    if (!dryRun) {
      const tmp = `${outPath}.tmp`;
      await fs.writeFile(tmp, output);
      await fs.rename(tmp, outPath);

      if (outPath !== filePath) {
        pathRewrites += await replacePathEverywhere(fromUrl, outUrl);
        await fs.unlink(filePath).catch(() => {});
      }
    }

    compressed += 1;
    savedBytes += Math.max(0, delta);
  } catch (error) {
    errors += 1;
    console.error(`  Error ${filePath}: ${error.message}`);
  }
}

console.log("");
console.log(`Scanned: ${scanned}`);
console.log(`Compressed: ${compressed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Still over ${maxBytes}B: ${stillOver}`);
console.log(`Path rewrites: ${pathRewrites}`);
console.log(`Errors: ${errors}`);
console.log(`Saved: ${(savedBytes / 1024 / 1024).toFixed(1)} MB${dryRun ? " (dry-run)" : ""}`);

if (sql) await sql.end();
