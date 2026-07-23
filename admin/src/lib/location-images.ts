export function parseCardImages(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  } catch {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

export function serializeCardImages(urls: string[]): string | null {
  const cleaned = urls.map((url) => url.trim()).filter(Boolean);
  return cleaned.length ? JSON.stringify(cleaned) : null;
}

export function cardImagesFromTextarea(value: string): string | null {
  return serializeCardImages(
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

export function cardImagesToTextarea(raw: string | null | undefined): string {
  return parseCardImages(raw).join("\n");
}
