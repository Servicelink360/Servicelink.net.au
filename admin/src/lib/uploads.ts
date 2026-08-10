import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

/** Longest edge for CMS uploads — matches hero/card image specs. */
export const UPLOAD_MAX_EDGE = 1920;
/** WebP quality for compressed uploads. */
export const UPLOAD_WEBP_QUALITY = 78;

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

/**
 * Compress raster uploads to WebP (max edge 1920). SVG is stored as-is.
 * Animated GIFs keep the original file when sharp can't safely convert them.
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
    const image = sharp(input, { animated: false, failOn: "none" }).rotate();
    const meta = await image.metadata();

    // Keep tiny animated GIFs as-is when multi-page
    if (ext === ".gif" && (meta.pages ?? 1) > 1) {
      return { buffer: input, ext: ".gif" };
    }

    const buffer = await image
      .resize({
        width: UPLOAD_MAX_EDGE,
        height: UPLOAD_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: UPLOAD_WEBP_QUALITY,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer();

    return { buffer, ext: ".webp" };
  } catch {
    // Fall back to original bytes if decode fails
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

  // Unique filenames avoid browser/CDN cache serving an overwritten file.
  const filename = `${stem}-${Date.now()}${compressed.ext}`;
  const targetPath = path.join(uploadDir, filename);

  await fs.writeFile(targetPath, compressed.buffer);

  return `/uploads/images/${scopePath}/${filename}`.replace(/\/+/g, "/");
}
