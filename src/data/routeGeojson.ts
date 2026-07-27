type GeoJsonProperties = Record<string, unknown>

export interface GeoJsonFeature {
  type: "Feature"
  properties?: GeoJsonProperties
  geometry?: unknown
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection"
  features: GeoJsonFeature[]
}

export interface LoadedRouteGeojson {
  routeNumber: string
  routeKey: string
  sourcePath: string
  stroke: string | null
  data: GeoJsonFeatureCollection
}

const routeGeojsonModules = import.meta.glob("/geo/*.geojson", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>

function normalizeRouteKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^route[-_\s]*/i, "")
    .replace(/[\/_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function getFileStem(path: string) {
  const fileName = path.split("/").pop() ?? path
  return fileName.replace(/\.geojson$/i, "")
}

function getFeatureStroke(feature: GeoJsonFeature) {
  const stroke = feature.properties?.stroke
  return typeof stroke === "string" && stroke.trim() ? stroke.trim() : null
}

function getCollectionStroke(collection: GeoJsonFeatureCollection) {
  for (const feature of collection.features) {
    const stroke = getFeatureStroke(feature)
    if (stroke) return stroke
  }

  return null
}

const loadedRouteGeojson = Object.entries(routeGeojsonModules)
  .map(([sourcePath, raw]) => {
    const routeNumber = getFileStem(sourcePath).replace(/^route[-_\s]*/i, "")
    const data = JSON.parse(raw) as GeoJsonFeatureCollection

    return {
      routeNumber,
      routeKey: normalizeRouteKey(routeNumber),
      sourcePath,
      stroke: getCollectionStroke(data),
      data,
    }
  })
  .filter((item) => Boolean(item.routeKey))

const routeGeojsonByKey = new Map(loadedRouteGeojson.map((item) => [item.routeKey, item]))

export function getLoadedRouteGeojson(routeNumber: string) {
  return routeGeojsonByKey.get(normalizeRouteKey(routeNumber)) ?? null
}

export function getActiveRouteGeojson(routeNumbers: string[]) {
  return routeNumbers
    .map((routeNumber) => getLoadedRouteGeojson(routeNumber))
    .filter((value): value is LoadedRouteGeojson => Boolean(value))
}

export function getLoadedRouteNumbers() {
  return loadedRouteGeojson.map((item) => item.routeNumber)
}
