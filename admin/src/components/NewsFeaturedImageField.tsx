"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/ImageUploadField";
import { IMAGE_SPECS } from "@/lib/image-specs";

type NewsFeaturedImageFieldProps = {
  defaultSlug?: string;
  defaultValue?: string;
};

export function NewsFeaturedImageField({
  defaultSlug = "",
  defaultValue = "",
}: NewsFeaturedImageFieldProps) {
  const [scope, setScope] = useState(`news/${defaultSlug || "draft"}`);

  useEffect(() => {
    const slugInput = document.getElementById("slug") as HTMLInputElement | null;
    if (!slugInput) return;

    const sync = () => {
      setScope(`news/${slugInput.value.trim() || "draft"}`);
    };

    slugInput.addEventListener("input", sync);
    sync();

    return () => slugInput.removeEventListener("input", sync);
  }, []);

  return (
    <div className="admin-field">
      <ImageUploadField
        name="featuredImage"
        label="Featured image"
        defaultValue={defaultValue}
        uploadScope={scope}
        preferredName="featured"
        recommendedSize={IMAGE_SPECS.newsFeatured}
        helpText="Upload after setting the post slug so files land in the correct folder."
      />
    </div>
  );
}
