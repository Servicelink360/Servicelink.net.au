"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { DeleteIcon, EditIcon } from "@/components/AdminActionIcons";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export type SeoServiceRow = {
  id: string;
  name: string;
  slug: string;
  linkedServiceSlug: string | null;
  published: boolean;
  sortOrder: number;
};

type SeoServicesTableProps = {
  rows: SeoServiceRow[];
  deleteSeoService: (id: string) => Promise<void>;
};

export function SeoServicesTable({ rows, deleteSeoService }: SeoServicesTableProps) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Name</th>
          <th>Slug</th>
          <th>Linked service</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.sortOrder}</td>
            <td>{row.name}</td>
            <td>{row.slug}</td>
            <td>{row.linkedServiceSlug ?? "—"}</td>
            <td>
              <span className={`admin-badge ${row.published ? "admin-badge--live" : ""}`}>
                {row.published ? "Published" : "Hidden"}
              </span>
            </td>
            <td>
              <div className="admin-actions">
                <Link
                  className="admin-btn admin-btn--ghost admin-btn--icon"
                  href={`/dashboard/seo-services/${row.id}`}
                  aria-label="Edit"
                  title="Edit"
                >
                  <EditIcon />
                </Link>
                <DeleteServiceButton
                  id={row.id}
                  label={row.name}
                  deleteSeoService={deleteSeoService}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DeleteServiceButton({
  id,
  label,
  deleteSeoService,
}: {
  id: string;
  label: string;
  deleteSeoService: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => {
      void deleteSeoService(id).then(() => setOpen(false));
    });
  }

  return (
    <>
      <button
        className="admin-btn admin-btn--danger admin-btn--icon"
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        aria-label="Delete"
        title="Delete"
      >
        <DeleteIcon />
      </button>

      <ConfirmDialog
        open={open}
        title="Delete SEO service"
        description={`"${label}" will be permanently removed. SEO pages using this service may be affected.`}
        confirmLabel="Delete service"
        cancelLabel="Cancel"
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
