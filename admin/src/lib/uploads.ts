import fs from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

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
  const stem = path.basename(name, path.extname(name))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return stem || "image";
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
  // Unique filenames avoid browser/CDN cache serving an overwritten file.
  const filename = `${stem}-${Date.now()}${ext}`;
  const targetPath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);

  return `/uploads/images/${scopePath}/${filename}`.replace(/\/+/g, "/");
}
