import {
  formatCount,
  type Service360OpsStats,
} from "@/lib/service360-ops";
import { SERVICE360_URL } from "./service360-content";

type Service360OpsMetricsProps = {
  stats: Service360OpsStats;
  className?: string;
};

function formatLastUpdated(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return null;

  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function Service360OpsMetrics({
  stats,
  className = "",
}: Service360OpsMetricsProps) {
  const lastUpdated = formatLastUpdated(stats.updatedAt);

  const issues = [
    {
      key: "new",
      label: "New",
      value: formatCount(stats.openFaultsCount),
      tone: "new" as const,
    },
    {
      key: "progress",
      label: "In progress",
      value: formatCount(stats.pendingFaultsCount),
      tone: "progress" as const,
    },
    {
      key: "fixed",
      label: "Fixed",
      value: formatCount(stats.fixedFaultsCount),
      tone: "fixed" as const,
    },
  ];

  return (
    <div className={`m1-s360-metrics-wrap ${className}`.trim()}>
      <div className="m1-s360-metrics__live">
        <span className="m1-s360-metrics__pulse" aria-hidden />
        <a
          href={SERVICE360_URL}
          className="m1-s360-metrics__live-text"
          target="_blank"
          rel="noopener noreferrer"
        >
          Live from Service360
        </a>
        {lastUpdated ? (
          <span className="m1-s360-metrics__updated">
            Last updated {lastUpdated}
          </span>
        ) : null}
      </div>

      <div className="m1-s360-panel" aria-label="Service360 live metrics">
        <article className="m1-s360-stat">
          <p className="m1-s360-stat__kicker">Portfolio</p>
          <p className="m1-s360-stat__value">{formatCount(stats.sitesCount)}</p>
          <p className="m1-s360-stat__label">Active sites</p>
          <p className="m1-s360-stat__hint">Assigned portfolio sites</p>
        </article>

        <article className="m1-s360-stat">
          <p className="m1-s360-stat__kicker">Delivery</p>
          <p className="m1-s360-stat__value">
            {formatCount(stats.newReportsCount)}
          </p>
          <p className="m1-s360-stat__label">Services</p>
          <p className="m1-s360-stat__hint">Completed in last 30 days</p>
        </article>

        <article className="m1-s360-stat m1-s360-stat--issues">
          <p className="m1-s360-stat__kicker">Operations</p>
          <p className="m1-s360-stat__label">Maintenance issues</p>
          <ul className="m1-s360-issues">
            {issues.map((issue) => (
              <li
                key={issue.key}
                className={`m1-s360-issue m1-s360-issue--${issue.tone}`}
              >
                <span className="m1-s360-issue__swatch" aria-hidden />
                <span className="m1-s360-issue__label">{issue.label}</span>
                <span className="m1-s360-issue__value">{issue.value}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
