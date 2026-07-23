"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ImageSectionFormProps = {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  saveLabel?: string;
};

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-btn admin-btn--section-save" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ImageSectionForm({
  action,
  children,
  saveLabel = "Save",
}: ImageSectionFormProps) {
  return (
    <form action={action} className="admin-image-section-form">
      {children}
      <SaveButton label={saveLabel} />
    </form>
  );
}
