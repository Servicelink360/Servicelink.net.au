"use client";

import { useState } from "react";
import { CardImagesField } from "@/components/CardImagesField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { IMAGE_SPECS } from "@/lib/image-specs";

export function NewSeoServiceImageFields() {
  const [scope, setScope] = useState("services/general");

  return (
    <>
      <div className="admin-field">
        <label htmlFor="linkedServiceSlug">Linked static service slug</label>
        <input
          id="linkedServiceSlug"
          name="linkedServiceSlug"
          placeholder="general-cleaning"
          onChange={(event) => {
            const slug = event.target.value.trim() || "general";
            setScope(`services/${slug}`);
          }}
        />
        <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.8125rem" }}>
          Set this before uploading so files land in the correct folder.
        </p>
      </div>
      <div className="admin-field">
        <ImageUploadField
          name="heroImage"
          label="Default hero image"
          uploadScope={scope}
          preferredName="hero"
          recommendedSize={IMAGE_SPECS.serviceHero}
        />
      </div>
      <div className="admin-field">
        <CardImagesField
          name="cardImages"
          label="Default card images"
          uploadScope={scope}
          recommendedSize={IMAGE_SPECS.serviceCard}
        />
      </div>
    </>
  );
}
