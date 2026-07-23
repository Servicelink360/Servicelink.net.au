"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeleteIcon, EditIcon, ViewIcon } from "@/components/AdminActionIcons";
import { buildSeoPageTree, type SeoPageRow, type StateNode } from "@/lib/seo-page-tree";
import { publicLocationPageUrl } from "@/lib/site-url";

type SeoPagesTableProps = {
  rows: SeoPageRow[];
  deleteSeoPage: (id: string) => Promise<void>;
};

type CityNode = ReturnType<typeof buildSeoPageTree>[number]["cities"][number];
type MetroNode = CityNode["metros"][number];

function ToggleButton({
  expanded,
  onClick,
  label,
}: {
  expanded: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="admin-tree-toggle"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={label}
    >
      {expanded ? "−" : "+"}
    </button>
  );
}

function citiesPanelKey(stateKey: string) {
  return `${stateKey}:cities`;
}

function metrosPanelKey(stateKey: string) {
  return `${stateKey}:metros`;
}

function formatServiceName(row: SeoPageRow): string {
  if (row.serviceName) return row.serviceName;
  const match = row.h1.match(/^(.+?)\s+in\s+/i);
  return match?.[1] ?? "—";
}

function metroServiceSummary(pages: SeoPageRow[]) {
  const names = [
    ...new Set(
      pages
        .map((page) => page.serviceName)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return names.length ? names.join(", ") : undefined;
}

function TreeRowTail({ service }: { service?: string }) {
  return (
    <>
      <td className="admin-table__group-blank">{service ?? null}</td>
      <td className="admin-table__group-blank" />
      <td className="admin-table__group-blank" />
      <td className="admin-table__group-blank" />
      <td className="admin-table__group-blank" />
    </>
  );
}

export function SeoPagesTable({ rows, deleteSeoPage }: SeoPagesTableProps) {
  const tree = useMemo(() => buildSeoPageTree(rows), [rows]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  function toggle(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (rows.length === 0) {
    return <div className="admin-tree-empty">No SEO pages match the current filters.</div>;
  }

  return (
    <div className="admin-tree">
      <table className="admin-table admin-table--tree">
        <thead>
          <tr>
            <th>Location</th>
            <th>Service</th>
            <th>Type</th>
            <th>Title</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tree.map((state) => (
            <StateBlock
              key={state.key}
              state={state}
              expanded={expanded}
              toggle={toggle}
              deleteSeoPage={deleteSeoPage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StateBlock({
  state,
  expanded,
  toggle,
  deleteSeoPage,
}: {
  state: StateNode;
  expanded: Set<string>;
  toggle: (key: string) => void;
  deleteSeoPage: (id: string) => Promise<void>;
}) {
  const citiesOpen = expanded.has(citiesPanelKey(state.key));
  const metrosOpen = expanded.has(metrosPanelKey(state.key));

  const stateMetros = state.cities.flatMap((city) =>
    city.metros.map((metro) => ({
      ...metro,
      cityName: city.cityName,
      isCityLevel: metro.metroName === "All city",
    })),
  );

  return (
    <>
      <tr className="admin-tree-row admin-tree-row--state">
        <td>
          <div className="admin-tree-line admin-tree-line--state-nav">
            <strong className="admin-tree-name">{state.state}</strong>
            <button
              type="button"
              className={`admin-tree-nav-btn ${citiesOpen ? "is-active" : ""}`}
              onClick={() => toggle(citiesPanelKey(state.key))}
              aria-expanded={citiesOpen}
            >
              Cities
              <span className="admin-tree-nav-count">{state.cityCount}</span>
            </button>
            <button
              type="button"
              className={`admin-tree-nav-btn ${metrosOpen ? "is-active" : ""}`}
              onClick={() => toggle(metrosPanelKey(state.key))}
              aria-expanded={metrosOpen}
            >
              Metros
              <span className="admin-tree-nav-count">{state.metroCount}</span>
            </button>
            <span className="admin-tree-stats">
              <span>{state.pageCount} pages</span>
            </span>
          </div>
        </td>
        <TreeRowTail />
      </tr>

      {citiesOpen
        ? state.cities.map((city) => (
            <CityBlock
              key={city.key}
              city={city}
              expanded={expanded}
              cityOpen={expanded.has(city.key)}
              toggle={toggle}
              deleteSeoPage={deleteSeoPage}
            />
          ))
        : null}

      {metrosOpen
        ? stateMetros.map((metro) => (
            <MetroBlock
              key={`${state.key}:flat:${metro.key}`}
              metro={metro}
              metroOpen={expanded.has(metro.key)}
              isCityLevel={metro.isCityLevel}
              toggle={toggle}
              deleteSeoPage={deleteSeoPage}
              depth={1}
              subtitle={metro.isCityLevel ? `${metro.cityName} · city pages` : metro.cityName}
            />
          ))
        : null}
    </>
  );
}

function CityBlock({
  city,
  expanded,
  cityOpen,
  toggle,
  deleteSeoPage,
}: {
  city: CityNode;
  expanded: Set<string>;
  cityOpen: boolean;
  toggle: (key: string) => void;
  deleteSeoPage: (id: string) => Promise<void>;
}) {
  return (
    <>
      <tr className="admin-tree-row admin-tree-row--city">
        <td>
          <div className="admin-tree-line" data-depth="1">
            <ToggleButton
              expanded={cityOpen}
              onClick={() => toggle(city.key)}
              label={`${cityOpen ? "Collapse" : "Expand"} ${city.cityName}`}
            />
            <strong className="admin-tree-name">{city.cityName}</strong>
            <span className="admin-tree-stats">
              <span>{city.pageCount} pages</span>
              <span>
                {city.metros.filter((metro) => metro.metroName !== "All city").length} metros
              </span>
            </span>
          </div>
        </td>
        <TreeRowTail service={metroServiceSummary(city.metros.flatMap((metro) => metro.pages))} />
      </tr>

      {cityOpen
        ? city.metros.map((metro) => {
            const metroOpen = expanded.has(metro.key);
            const isCityLevel = metro.metroName === "All city";

            return (
              <MetroBlock
                key={metro.key}
                metro={metro}
                metroOpen={metroOpen}
                isCityLevel={isCityLevel}
                toggle={toggle}
                deleteSeoPage={deleteSeoPage}
                depth={2}
              />
            );
          })
        : null}
    </>
  );
}

function MetroBlock({
  metro,
  metroOpen,
  isCityLevel,
  toggle,
  deleteSeoPage,
  depth,
  subtitle,
}: {
  metro: MetroNode;
  metroOpen: boolean;
  isCityLevel: boolean;
  toggle: (key: string) => void;
  deleteSeoPage: (id: string) => Promise<void>;
  depth: number;
  subtitle?: string;
}) {
  const pageDepth = depth + 1;
  const rowClass = isCityLevel ? "admin-tree-row--city-pages" : "admin-tree-row--metro";

  return (
    <>
      <tr className={`admin-tree-row ${rowClass}`}>
        <td>
          <div className="admin-tree-line" data-depth={String(depth)}>
            <ToggleButton
              expanded={metroOpen}
              onClick={() => toggle(metro.key)}
              label={`${metroOpen ? "Collapse" : "Expand"} ${metro.metroName}`}
            />
            <strong className="admin-tree-name">{isCityLevel ? "City pages" : metro.metroName}</strong>
            {subtitle ? <span className="admin-tree-subtitle">{subtitle}</span> : null}
            <span className="admin-tree-count">{metro.pages.length} pages</span>
          </div>
        </td>
        <TreeRowTail service={metroServiceSummary(metro.pages)} />
      </tr>
      {metroOpen ? <PageRows pages={metro.pages} deleteSeoPage={deleteSeoPage} depth={pageDepth} /> : null}
    </>
  );
}

function PageRows({
  pages,
  deleteSeoPage,
  depth,
}: {
  pages: SeoPageRow[];
  deleteSeoPage: (id: string) => Promise<void>;
  depth: number;
}) {
  return (
    <>
      {pages.map((row) => (
        <tr key={row.id} className="admin-tree-row admin-tree-row--page">
          <td>
            <div className="admin-tree-line admin-tree-line--leaf" data-depth={String(depth)}>
              <span className="admin-tree-leaf" aria-hidden="true" />
            </div>
          </td>
          <td>{formatServiceName(row)}</td>
          <td>{row.pageTypeLabel}</td>
          <td>{row.h1}</td>
          <td>
            <span className={`admin-badge ${row.published ? "admin-badge--live" : ""}`}>
              {row.published ? "Published" : "Draft"}
            </span>
          </td>
          <td>
            <div className="admin-actions">
              {row.published ? (
                <a
                  className="admin-btn admin-btn--ghost admin-btn--icon"
                  href={publicLocationPageUrl(row.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View page"
                  title="View page"
                >
                  <ViewIcon />
                </a>
              ) : null}
              <Link
                className="admin-btn admin-btn--ghost admin-btn--icon"
                href={`/dashboard/seo-pages/${row.id}`}
                aria-label="Edit"
                title="Edit"
              >
                <EditIcon />
              </Link>
              <DeletePageButton
                id={row.id}
                label={row.h1}
                deleteSeoPage={deleteSeoPage}
              />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function DeletePageButton({
  id,
  label,
  deleteSeoPage,
}: {
  id: string;
  label: string;
  deleteSeoPage: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => {
      void deleteSeoPage(id).then(() => setOpen(false));
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
        title="Delete SEO page"
        description={`"${label}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete page"
        cancelLabel="Cancel"
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
