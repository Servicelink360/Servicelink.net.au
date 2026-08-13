"use client";

import { useMemo, useState } from "react";

export type ChartCount = { label: string; total: number };
export type ChartDay = { day: string; views: number; visitors: number; enquiries: number };

const ENGINE_COLORS: Record<string, string> = {
  Google: "#4285f4",
  Bing: "#00a4a6",
  Yahoo: "#6001d2",
  DuckDuckGo: "#de5833",
  Facebook: "#1877f2",
  LinkedIn: "#0a66c2",
  Direct: "#64748b",
  Unknown: "#94a3b8",
  ChatGPT: "#10a37f",
  Perplexity: "#1fb8a7",
};

const PALETTE = [
  "#0f172a",
  "#2563eb",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#64748b",
  "#ec4899",
  "#14b8a6",
];

function colorFor(label: string, index: number) {
  return ENGINE_COLORS[label] || PALETTE[index % PALETTE.length];
}

function formatDay(day: string) {
  const date = new Date(`${day}T00:00:00`);
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function niceMax(value: number) {
  if (value <= 0) return 4;
  const padded = value * 1.15;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  return Math.ceil(padded / magnitude) * magnitude;
}

function EmptyState({ text }: { text: string }) {
  return <p className="admin-stat-empty">{text}</p>;
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="admin-chart-legend">
      {items.map((item) => (
        <span key={item.label}>
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function AreaChart({
  data,
  empty,
}: {
  data: ChartDay[];
  empty: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const width = 860;
  const height = 280;
  const pad = { top: 20, right: 18, bottom: 36, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...data.map((row) => Math.max(row.views, row.visitors, row.enquiries)), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((part) => Math.round(max * part));

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const step = data.length === 1 ? 0 : innerW / (data.length - 1);
    return data.map((row, index) => {
      const x = pad.left + index * step;
      const y = (value: number) => pad.top + innerH - (value / max) * innerH;
      const views = Number(row.views || 0);
      const visitors = Number(row.visitors || 0);
      const enquiries = Number(row.enquiries || 0);
      return {
        ...row,
        views,
        visitors,
        enquiries,
        x,
        viewsY: y(views),
        visitorsY: y(visitors),
        enquiriesY: y(enquiries),
      };
    });
  }, [data, innerH, innerW, max, pad.left, pad.top]);

  if (data.length === 0) return <EmptyState text={empty} />;

  const toLine = (key: "viewsY" | "visitorsY" | "enquiriesY") =>
    points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point[key]}`).join(" ");
  const toArea = (key: "viewsY" | "visitorsY" | "enquiriesY") => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${toLine(key)} L${last.x} ${pad.top + innerH} L${first.x} ${pad.top + innerH} Z`;
  };

  const hover = active === null ? null : points[active];
  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="admin-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg" role="img" aria-label="Daily visitors chart">
        {ticks.map((tick) => {
          const y = pad.top + innerH - (tick / max) * innerH;
          return (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="admin-chart-grid" />
              <text x={pad.left - 8} y={y + 4} className="admin-chart-axis" textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}
        <path d={toArea("viewsY")} fill="rgba(37, 99, 235, 0.14)" />
        <path d={toLine("viewsY")} className="admin-chart-line admin-chart-line--views" />
        <path d={toLine("visitorsY")} className="admin-chart-line admin-chart-line--visitors" />
        <path d={toLine("enquiriesY")} className="admin-chart-line admin-chart-line--enquiries" />
        {points.map((point, index) =>
          index % labelStep === 0 || index === points.length - 1 ? (
            <text key={point.day} x={point.x} y={height - 12} className="admin-chart-axis" textAnchor="middle">
              {formatDay(point.day)}
            </text>
          ) : null,
        )}
        {hover ? (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad.top} y2={pad.top + innerH} className="admin-chart-hover-line" />
            <circle cx={hover.x} cy={hover.viewsY} r="4.5" fill="#2563eb" />
            <circle cx={hover.x} cy={hover.visitorsY} r="4.5" fill="#0f172a" />
            <circle cx={hover.x} cy={hover.enquiriesY} r="4.5" fill="#f59e0b" />
          </>
        ) : null}
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={(event) => {
            const svg = event.currentTarget.ownerSVGElement;
            if (!svg) return;
            const bounds = svg.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * width;
            const index = Math.round(((x - pad.left) / innerW) * (points.length - 1));
            setActive(Math.max(0, Math.min(points.length - 1, index)));
          }}
          onMouseLeave={() => setActive(null)}
        />
      </svg>
      <Legend
        items={[
          { label: "Page views", color: "#2563eb" },
          { label: "Visitors", color: "#0f172a" },
          { label: "Enquiries", color: "#f59e0b" },
        ]}
      />
      {hover ? (
        <div className="admin-chart-tooltip">
          <strong>{formatDay(hover.day)}</strong>
          <span>Views {hover.views}</span>
          <span>Visitors {hover.visitors}</span>
          <span>Enquiries {hover.enquiries}</span>
        </div>
      ) : (
        <p className="admin-chart-hint">Hover a day for exact numbers.</p>
      )}
    </div>
  );
}

export function DonutChart({
  rows,
  empty,
}: {
  rows: ChartCount[];
  empty: string;
}) {
  const total = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  if (rows.length === 0 || total === 0) return <EmptyState text={empty} />;

  const size = 220;
  const radius = 72;
  const stroke = 28;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="admin-chart admin-chart--donut">
      <svg viewBox={`0 0 ${size} ${size}`} className="admin-chart-svg admin-chart-svg--donut" role="img">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        {rows.map((row, index) => {
          const value = Number(row.total || 0);
          const dash = (value / total) * circumference;
          const circle = (
            <circle
              key={row.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colorFor(row.label, index)}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return circle;
        })}
        <text x={size / 2} y={size / 2 - 4} className="admin-chart-donut-total" textAnchor="middle">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 16} className="admin-chart-donut-label" textAnchor="middle">
          total
        </text>
      </svg>
      <div className="admin-chart-legend admin-chart-legend--stack">
        {rows.map((row, index) => (
          <span key={row.label}>
            <i style={{ background: colorFor(row.label, index) }} />
            {row.label}
            <em>{row.total}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({
  rows,
  empty,
}: {
  rows: ChartCount[];
  empty: string;
}) {
  const max = Math.max(...rows.map((row) => Number(row.total || 0)), 1);
  if (rows.length === 0) return <EmptyState text={empty} />;

  return (
    <div className="admin-chart-bars">
      {rows.map((row, index) => {
        const total = Number(row.total || 0);
        return (
          <div key={row.label} className="admin-chart-bar">
            <div className="admin-chart-bar__label" title={row.label}>
              {row.label}
            </div>
            <div className="admin-chart-bar__track">
              <div
                className="admin-chart-bar__fill"
                style={{
                  width: `${Math.max(4, (total / max) * 100)}%`,
                  background: colorFor(row.label, index),
                }}
              />
            </div>
            <div className="admin-chart-bar__value">{total}</div>
          </div>
        );
      })}
    </div>
  );
}
