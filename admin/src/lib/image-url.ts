const INTERNAL_PREFIXES = ["/uploads/", "/images/", "/logo/"];

export function isInternalImagePath(value: string) {
  const trimmed = value.trim();
  return INTERNAL_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

export function assertInternalImageUrl(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!isInternalImagePath(trimmed)) {
    throw new Error(`${label} must use an internal path such as /uploads/images/...`);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    throw new Error(`${label} cannot use external URLs. Upload the file instead.`);
  }

  return trimmed;
}

export function assertInternalImageUrls(values: string[], label: string) {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => assertInternalImageUrl(value, label) as string);
}
