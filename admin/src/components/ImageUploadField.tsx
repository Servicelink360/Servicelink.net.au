"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";

export type HeroPersistTarget = {
  cityId: string;
  metroId?: string;
  onPersist: (heroImage: string | null) => Promise<{ ok: true; heroImage: string | null }>;
};

type ImageUploadFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  uploadScope: string;
  preferredName?: string;
  helpText?: string;
  recommendedSize?: string;
  fallbackPreviewUrl?: string | null;
  fallbackLabel?: string;
  saveHint?: string;
  persistTarget?: HeroPersistTarget;
};

function FileReplaceButton({
  uploading,
  onFile,
  label = "Replace",
}: {
  uploading: boolean;
  onFile: (file: File) => void;
  label?: string;
}) {
  return (
    <label className="admin-btn admin-btn--small admin-btn--ghost">
      {label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="admin-image-slot__file"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </label>
  );
}

export function ImageUploadField({
  name,
  label,
  defaultValue,
  uploadScope,
  preferredName,
  helpText,
  recommendedSize,
  fallbackPreviewUrl,
  fallbackLabel = "Default image used on the live site",
  saveHint = "Click Save to apply.",
  persistTarget,
}: ImageUploadFieldProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue?.trim() ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setValue(defaultValue?.trim() ?? "");
    setDirty(false);
    setSavedMessage(null);
    setPreviewError(false);
  }, [defaultValue]);

  function persistHero(heroImage: string | null) {
    if (!persistTarget) return;

    startTransition(async () => {
      setError(null);
      setSavedMessage(null);

      try {
        await persistTarget.onPersist(heroImage);
        setDirty(false);
        setSavedMessage(
          heroImage
            ? "Saved — live site updated."
            : "Removed — live site uses default image.",
        );
        router.refresh();
      } catch (persistError) {
        setError(
          persistError instanceof Error ? persistError.message : "Failed to save image.",
        );
      }
    });
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    setSavedMessage(null);
    setPreviewError(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scope", uploadScope);
      if (preferredName) {
        formData.append("name", preferredName);
      }

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
        throw new Error(payload.error ?? "Upload failed.");
      }

      setValue(payload.url);
      if (persistTarget) {
        persistHero(payload.url);
      } else {
        setDirty(true);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setValue("");
    setPreviewError(false);
    setSavedMessage(null);

    if (persistTarget) {
      persistHero(null);
    } else {
      setDirty(true);
    }
  }

  const busy = uploading || isPending;
  const previewSrc = value ? resolvePublicAssetUrl(value) : "";

  return (
    <div className="admin-image-set">
      <label className="admin-image-set__label">{label}</label>
      {recommendedSize ? (
        <p className="admin-image-set__spec">
          <strong>Recommended size:</strong> {recommendedSize}
        </p>
      ) : null}
      {helpText ? <p className="admin-image-set__help">{helpText}</p> : null}

      <input type="hidden" name={name} value={value} />

      {value ? (
        <div className="admin-image-slot admin-image-slot--single">
          <div className="admin-image-slot__preview admin-image-slot__preview--hero">
            {!previewError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc} alt="" onError={() => setPreviewError(true)} />
            ) : (
              <div className="admin-image-slot__preview-error">
                Preview unavailable — file may be missing. Try re-uploading.
              </div>
            )}
            <div className="admin-image-slot__actions">
              <FileReplaceButton
                uploading={busy}
                onFile={(file) => void handleUpload(file)}
              />
              <button
                type="button"
                className="admin-btn admin-btn--small admin-btn--danger"
                disabled={busy}
                onClick={handleRemove}
              >
                {isPending ? "Saving…" : "Remove"}
              </button>
            </div>
          </div>
          <p className="admin-image-set__path">{value}</p>
        </div>
      ) : fallbackPreviewUrl ? (
        <div className="admin-image-slot admin-image-slot--single">
          <p className="admin-image-set__fallback-label">{fallbackLabel}</p>
          <div className="admin-image-slot__preview admin-image-slot__preview--hero admin-image-slot__preview--fallback">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolvePublicAssetUrl(fallbackPreviewUrl)} alt="" />
            <div className="admin-image-slot__actions">
              <FileReplaceButton
                uploading={busy}
                label={uploading ? "Uploading…" : isPending ? "Saving…" : "Upload custom image"}
                onFile={(file) => void handleUpload(file)}
              />
            </div>
          </div>
          <p className="admin-image-set__path">{fallbackPreviewUrl}</p>
        </div>
      ) : (
        <label className="admin-image-slot__empty admin-image-slot__empty--hero">
          <span>{busy ? "Working…" : "Click to upload image"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="admin-image-slot__file"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />
        </label>
      )}

      {savedMessage ? <p className="admin-image-set__success">{savedMessage}</p> : null}
      {!persistTarget && dirty ? (
        <p className="admin-image-set__notice">{saveHint}</p>
      ) : null}
      {error ? <p className="admin-image-set__error">{error}</p> : null}
    </div>
  );
}
