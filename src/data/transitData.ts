import rawData from "@/data/transitData.json"
import type {
  DetailedScheduleRow,
  OfficialRoute,
  OfficialStop,
  RouteCategory,
  RouteStopSection,
  TransitData,
} from "@/types"

const transitData = rawData as TransitData

const separatorStops = new Set(["↓", "?", "→"])

function getRouteAliases(routeNumber: string) {
  const normalized = routeNumber.replace("/1", "")
  return normalized === routeNumber ? [routeNumber] : [routeNumber, normalized]
}

function uniqueConsecutive(stops: string[]) {
  return stops.filter((stop, index) => stop !== stops[index - 1])
}

function buildSectionTitle(stops: string[], index: number, total: number) {
  const first = stops[0]
  const last = stops.at(-1)

  if (!first || !last) return `Направление ${index + 1}`
  if (first === last) return "Кольцевое движение"

  const title = `${first} → ${last}`
  return total === 1 ? title : `Направление ${index + 1}: ${title}`
}

export interface PreparedDetailedBodyRow {
  stopName: string
  cells: DetailedScheduleRow["cells"]
}

export interface PreparedDetailedSchedule {
  headerRows: DetailedScheduleRow[]
  bodyRows: PreparedDetailedBodyRow[]
  hasUsableTimes: boolean
}

export const officialStops = transitData.officialStops
export const officialRoutes = transitData.routes
export const routeCategories: RouteCategory[] = [
  "Городские",
  "Пригородные",
  "Пригородные межмуниципальные",
]

export const mapHubStops = (() => {
  const byName = new Map<string, OfficialStop>()

  for (const stop of officialStops) {
    const current = byName.get(stop.name)

    if (!current || stop.routes.length > current.routes.length) {
      byName.set(stop.name, stop)
    }
  }

  return [...byName.values()]
    .sort((left, right) => right.routes.length - left.routes.length || left.siteStopId - right.siteStopId)
    .slice(0, 8)
})()

export function getStopSecondaryText(stop: OfficialStop) {
  return [stop.address, stop.direction].filter(Boolean).join(" • ")
}

export function getRouteCategoryBadge(category: RouteCategory) {
  if (category === "Городские") return "Город"
  if (category === "Пригородные") return "Пригород"
  return "Екатеринбург"
}

export function getRouteEffectiveDate(route: OfficialRoute) {
  return route.detailEffectiveDate || route.shortEffectiveDate
}

export function routeMatchesNumber(routeNumber: string, value: string) {
  return getRouteAliases(routeNumber).includes(value)
}

export function getRouteStopsInSiteOrder(routeNumber: string) {
  return officialStops.filter((stop) =>
    stop.routes.some((value) => routeMatchesNumber(routeNumber, value)),
  )
}

export function getRouteStopSections(route: OfficialRoute): RouteStopSection[] {
  const labels = route.detailedRows
    .map((row) => row.cells[0]?.text.trim())
    .filter((value): value is string => Boolean(value))

  const sections: string[][] = []
  let currentSection: string[] = []

  for (const label of labels) {
    if (separatorStops.has(label)) {
      if (currentSection.length) {
        sections.push(uniqueConsecutive(currentSection))
        currentSection = []
      }
      continue
    }

    currentSection.push(label)
  }

  if (currentSection.length) {
    sections.push(uniqueConsecutive(currentSection))
  }

  if (sections.length) {
    return sections.map((stops, index) => ({
      title: buildSectionTitle(stops, index, sections.length),
      stops,
    }))
  }

  const fallbackStops = uniqueConsecutive(
    getRouteStopsInSiteOrder(route.number).map((stop) => stop.name),
  )

  return fallbackStops.length
    ? [{ title: "Остановки маршрута", stops: fallbackStops }]
    : []
}

export function getPreparedDetailedSchedule(route: OfficialRoute): PreparedDetailedSchedule {
  const meaningfulRows = route.detailedRows.filter((row) =>
    row.cells.some((cell) => cell.text.trim()),
  )

  const headerRows = meaningfulRows.filter((row) => {
    const [firstCell, ...restCells] = row.cells
    return !firstCell?.text.trim() && restCells.some((cell) => cell.text.trim())
  })

  const bodyRows = meaningfulRows
    .filter((row) => row.cells[0]?.text.trim())
    .map((row) => ({
      stopName: row.cells[0].text.trim(),
      cells: row.cells.slice(1),
    }))

  const hasUsableTimes = bodyRows.some((row) =>
    row.cells.some((cell) => cell.text.trim()),
  )

  return {
    headerRows,
    bodyRows,
    hasUsableTimes,
  }
}
