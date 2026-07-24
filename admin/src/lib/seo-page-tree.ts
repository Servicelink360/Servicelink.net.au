export type SeoPageRow = {
  id: string;
  path: string;
  pageType: string;
  pageTypeLabel: string;
  h1: string;
  published: boolean;
  state: string;
  cityName: string;
  metroName: string | null;
  serviceName: string | null;
};

export type MetroNode = {
  key: string;
  metroName: string;
  pages: SeoPageRow[];
  pageCount: number;
  publishedCount: number;
};

export type CityNode = {
  key: string;
  state: string;
  cityName: string;
  metros: MetroNode[];
  pageCount: number;
  publishedCount: number;
};

export type StateNode = {
  key: string;
  state: string;
  cities: CityNode[];
  pageCount: number;
  publishedCount: number;
  cityCount: number;
  metroCount: number;
};

function metroLabel(metroName: string | null) {
  return metroName ?? "All city";
}

function countMetros(cities: CityNode[]) {
  return cities.reduce(
    (total, city) =>
      total + city.metros.filter((metro) => metro.metroName !== "All city").length,
    0,
  );
}

export function buildSeoPageTree(rows: SeoPageRow[]): StateNode[] {
  const stateMap = new Map<string, StateNode>();

  for (const row of rows) {
    let stateNode = stateMap.get(row.state);
    if (!stateNode) {
      stateNode = {
        key: `state:${row.state}`,
        state: row.state,
        cities: [],
        pageCount: 0,
        publishedCount: 0,
        cityCount: 0,
        metroCount: 0,
      };
      stateMap.set(row.state, stateNode);
    }

    stateNode.pageCount += 1;
    if (row.published) stateNode.publishedCount += 1;

    let cityNode = stateNode.cities.find((city) => city.cityName === row.cityName);
    if (!cityNode) {
      cityNode = {
        key: `city:${row.state}:${row.cityName}`,
        state: row.state,
        cityName: row.cityName,
        metros: [],
        pageCount: 0,
        publishedCount: 0,
      };
      stateNode.cities.push(cityNode);
    }

    cityNode.pageCount += 1;
    if (row.published) cityNode.publishedCount += 1;

    const label = metroLabel(row.metroName);
    let metroNode = cityNode.metros.find((metro) => metro.metroName === label);
    if (!metroNode) {
      metroNode = {
        key: `metro:${row.state}:${row.cityName}:${label}`,
        metroName: label,
        pages: [],
        pageCount: 0,
        publishedCount: 0,
      };
      cityNode.metros.push(metroNode);
    }

    metroNode.pages.push(row);
    metroNode.pageCount += 1;
    if (row.published) metroNode.publishedCount += 1;
  }

  const sortMetros = (a: MetroNode, b: MetroNode) => {
    if (a.metroName === "All city") return -1;
    if (b.metroName === "All city") return 1;
    return a.metroName.localeCompare(b.metroName);
  };

  return [...stateMap.values()]
    .sort((a, b) => a.state.localeCompare(b.state))
    .map((state) => {
      const cities = state.cities
        .sort((a, b) => a.cityName.localeCompare(b.cityName))
        .map((city) => ({
          ...city,
          metros: city.metros.sort(sortMetros).map((metro) => ({
            ...metro,
            pages: metro.pages.sort((a, b) =>
              (a.serviceName ?? "").localeCompare(b.serviceName ?? ""),
            ),
          })),
        }));

      return {
        ...state,
        cities,
        cityCount: cities.length,
        metroCount: countMetros(cities),
      };
    });
}
