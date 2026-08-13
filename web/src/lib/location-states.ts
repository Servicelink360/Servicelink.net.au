export type LocationCity = {
  id: string;
  slug: string;
  name: string;
  state: string;
  sortOrder?: number;
};

export type StateGroup = {
  code: string;
  label: string;
  href: string;
  cities: LocationCity[];
};

const STATE_ORDER = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"];

const STATE_LABELS: Record<string, string> = {
  NSW: "NSW",
  VIC: "VIC",
  QLD: "QLD",
  WA: "WA",
  SA: "SA",
  TAS: "TAS",
  NT: "NT",
  ACT: "ACT",
};

const STATE_ALIASES: Record<string, string> = {
  "NEW SOUTH WALES": "NSW",
  "VICTORIA": "VIC",
  "QUEENSLAND": "QLD",
  "WESTERN AUSTRALIA": "WA",
  "SOUTH AUSTRALIA": "SA",
  "TASMANIA": "TAS",
  "NORTHERN TERRITORY": "NT",
  "AUSTRALIAN CAPITAL TERRITORY": "ACT",
};

export function normalizeState(value?: string | null) {
  if (!value) return null;
  const raw = value.trim().toUpperCase().replace(/\s+/g, " ");
  if (!raw) return null;
  return STATE_ALIASES[raw] || raw;
}

export function stateLabel(code: string) {
  return STATE_LABELS[code] || code;
}

export function stateHref(code: string) {
  return `/locations?state=${encodeURIComponent(code)}`;
}

const STATE_HUB_SLUGS: Record<string, string> = {
  NSW: "sydney",
  VIC: "melbourne",
  QLD: "brisbane",
  WA: "perth",
  SA: "adelaide",
  TAS: "hobart",
  NT: "darwin",
  ACT: "canberra",
};

function sortCitiesInState(code: string, cities: LocationCity[]) {
  const hub = STATE_HUB_SLUGS[code];
  return cities.slice().sort((a, b) => {
    if (hub) {
      if (a.slug === hub && b.slug !== hub) return -1;
      if (b.slug === hub && a.slug !== hub) return 1;
    }
    const orderA = a.sortOrder ?? 9999;
    const orderB = b.sortOrder ?? 9999;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

export function groupCitiesByState(cities: LocationCity[]): StateGroup[] {
  const groups = new Map<string, LocationCity[]>();
  for (const city of cities) {
    const code = normalizeState(city.state);
    if (!code) continue;
    const list = groups.get(code) ?? [];
    list.push(city);
    groups.set(code, list);
  }

  const codes = [
    ...STATE_ORDER.filter((code) => groups.has(code)),
    ...[...groups.keys()].filter((code) => !STATE_ORDER.includes(code)).sort(),
  ];

  return codes.map((code) => ({
    code,
    label: stateLabel(code),
    href: stateHref(code),
    cities: sortCitiesInState(code, groups.get(code) ?? []),
  }));
}
