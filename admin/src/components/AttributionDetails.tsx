import { getPublicSiteUrl } from "@/lib/site-url";

type AttributionDetailsProps = {
  pagePath?: string | null;
  landingPath?: string | null;
  searchEngine?: string | null;
  trafficReferrer?: string | null;
  source?: string | null;
};

function pageHref(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) return null;
  return `${getPublicSiteUrl()}${path}`;
}

function PageLink({ path, label }: { path?: string | null; label: string }) {
  if (!path) return null;
  const href = pageHref(path);
  return (
    <div>
      {label}:{" "}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {path}
        </a>
      ) : (
        path
      )}
    </div>
  );
}

export function AttributionDetails({
  pagePath,
  landingPath,
  searchEngine,
  trafficReferrer,
  source,
}: AttributionDetailsProps) {
  return (
    <div style={{ fontSize: "0.8125rem", color: "#334155" }}>
      {source ? <div>Form: {source}</div> : null}
      <div>
        Engine: <strong>{searchEngine?.trim() || "—"}</strong>
      </div>
      <PageLink path={pagePath} label="Submitted from" />
      {landingPath && landingPath !== pagePath ? (
        <PageLink path={landingPath} label="Landed on" />
      ) : null}
      {trafficReferrer ? (
        <div style={{ wordBreak: "break-all" }}>
          Referrer:{" "}
          <a href={trafficReferrer} target="_blank" rel="noopener noreferrer">
            {trafficReferrer}
          </a>
        </div>
      ) : null}
    </div>
  );
}
