"use client";

import { useEffect, useState } from "react";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";
type CardImagesFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  uploadScope: string;
  helpText?: string;
  maxSlots?: number;
  recommendedSize?: string;
};

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function shortSizeLabel(recommendedSize?: string) {
  if (!recommendedSize) return null;
  const match = recommendedSize.match(/^([\d]+ × [\d]+ px)/);
  return match?.[1] ?? null;
}

export function CardImagesField({
  name,
  label,
  defaultValue,
  uploadScope,
  helpText,
  maxSlots = 3,
  recommendedSize,
}: CardImagesFieldProps) {
  const [slots, setSlots] = useState<string[]>(() => {
    const initial = parseLines(defaultValue ?? "");
    const next = Array.from({ length: maxSlots }, (_, index) => initial[index] ?? "");
    return next;
  });
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial = parseLines(defaultValue ?? "");
    setSlots(Array.from({ length: maxSlots }, (_, index) => initial[index] ?? ""));
  }, [defaultValue, maxSlots]);

  const storedValue = slots.filter(Boolean).join("\n");

  async function uploadToSlot(index: number, file: File) {
    setUploadingSlot(index);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scope", uploadScope);
      formData.append("name", `card-${index + 1}`);

      const response = await fetch("/api/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const payload = (await response.json()) as { url?: string; error?: string };
      if (response.status === 401) {
        throw new Error(
          payload.error ?? "Session expired. Log in again, then upload the image.",
        );
      }
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? `Failed to upload ${file.name}.`);
      }

      setSlots((current) => {
        const next = [...current];
        next[index] = payload.url as string;
        return next;
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploadingSlot(null);
    }
  }

  function clearSlot(index: number) {
    setSlots((current) => {
      const next = [...current];
      next[index] = "";
      return next;
    });
  }

  return (
    <div className="admin-image-set">
      <label className="admin-image-set__label">{label}</label>
      {recommendedSize ? (
        <p className="admin-image-set__spec">
          <strong>Recommended size:</strong> {recommendedSize}
        </p>
      ) : null}
      {helpText ? <p className="admin-image-set__help">{helpText}</p> : null}

      <input type="hidden" name={name} value={storedValue} />

      <div className="admin-image-set__grid">
        {slots.map((url, index) => (
          <div key={index} className="admin-image-slot">
            <p className="admin-image-slot__title">Card {index + 1}</p>
            {shortSizeLabel(recommendedSize) ? (
              <p className="admin-image-slot__size">{shortSizeLabel(recommendedSize)}</p>
            ) : null}
            {url ? (
              <div className="admin-image-slot__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolvePublicAssetUrl(url)} alt={`Card image ${index + 1}`} />
                <div className="admin-image-slot__actions">
                  <label className="admin-btn admin-btn--small admin-btn--ghost">
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="admin-image-slot__file"
                      disabled={uploadingSlot !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadToSlot(index, file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-btn admin-btn--small admin-btn--danger"
                    onClick={() => clearSlot(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="admin-image-slot__empty">
                <span>{uploadingSlot === index ? "Uploading..." : "Upload image"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="admin-image-slot__file"
                  disabled={uploadingSlot !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadToSlot(index, file);
                    event.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {error ? <p className="admin-image-set__error">{error}</p> : null}
    </div>
  );
}
