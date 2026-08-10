import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/** Longest edge for CMS uploads — matches hero/card image specs. */
export const UPLOAD_MAX_EDGE = 1920;
/** Hard cap for every compressed CMS image. */
export const UPLOAD_MAX_BYTES = 150 * 1024;

export function getWebPublicDir() {
  const configured = process.env.WEB_PUBLIC_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.resolve(process.cwd(), "..", "web", "public");
}

export function sanitizeUploadScope(scope: string) {
  return scope
    .trim()
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/+/g, "/");
}

export function sanitizeFileStem(name: string) {
  const stem = path
    .basename(name, path.extname(name))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return stem || "image";
}

async function encodeWebpUnderCap(
  input: Buffer,
  maxBytes: number,
): Promise<Buffer> {
  let edge = UPLOAD_MAX_EDGE;
  let best: Buffer | null = null;

  for (let pass = 0; pass < 8; pass += 1) {
    for (const quality of [72, 64, 56, 48, 40, 32, 24]) {
      const buffer = await sharp(input, { animated: false, failOn: "none" })
        .rotate()
        .resize({
          width: edge,
          height: edge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality,
          effort: 5,
          smartSubsample: true,
        })
        .toBuffer();

      if (!best || buffer.length < best.length) best = buffer;
      if (buffer.length <= maxBytes) return buffer;
    }

    edge = Math.max(640, Math.round(edge * 0.75));
  }

  return best ?? input;
}

/**
 * Compress raster uploads to WebP at or under 150 KB.
 * SVG is stored as-is. Animated GIFs keep the original when multi-frame.
 */
export async function compressImageBuffer(
  input: Buffer,
  originalExt: string,
): Promise<{ buffer: Buffer; ext: string }> {
  const ext = originalExt.toLowerCase();

  if (ext === ".svg") {
    return { buffer: input, ext: ".svg" };
  }

  if (!RASTER_EXTENSIONS.has(ext)) {
    throw new Error("Only JPG, PNG, WebP, GIF, and SVG uploads are allowed.");
  }

  try {
    const meta = await sharp(input, { animated: false, failOn: "none" }).metadata();

    if (ext === ".gif" && (meta.pages ?? 1) > 1) {
      return { buffer: input, ext: ".gif" };
    }

    const buffer = await encodeWebpUnderCap(input, UPLOAD_MAX_BYTES);
    return { buffer, ext: ".webp" };
  } catch {
    return { buffer: input, ext };
  }
}

export async function saveUploadedImage(
  file: File,
  scope: string,
  preferredName?: string,
): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Only JPG, PNG, WebP, GIF, and SVG uploads are allowed.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const scopePath = sanitizeUploadScope(scope);
  if (!scopePath) {
    throw new Error("Upload folder is required.");
  }

  const uploadDir = path.join(getWebPublicDir(), "uploads", "images", scopePath);
  await fs.mkdir(uploadDir, { recursive: true });

  const stem = sanitizeFileStem(preferredName || file.name);
  const input = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImageBuffer(input, ext);

  if (
    compressed.ext !== ".svg" &&
    compressed.ext !== ".gif" &&
    compressed.buffer.length > UPLOAD_MAX_BYTES
  ) {
    throw new Error("Could not compress image under 150 KB. Try a simpler photo.");
  }

  const filename = `${stem}-${Date.now()}${compressed.ext}`;
  const targetPath = path.join(uploadDir, filename);

  await fs.writeFile(targetPath, compressed.buffer);

  return `/uploads/images/${scopePath}/${filename}`.replace(/\/+/g, "/");
}
