export type Page = "home" | "routes" | "map" | "profile"

export type RouteCategory =
  | "Городские"
  | "Пригородные"
  | "Пригородные межмуниципальные"

export interface OfficialStop {
  id: string
  siteStopId: number
  name: string
  address: string
  direction: string
  routes: string[]
}

export interface ScheduleCell {
  kind: "h" | "d"
  className: string
  text: string
}

export interface DetailedScheduleRow {
  cells: ScheduleCell[]
}

export interface RouteStopSection {
  title: string
  stops: string[]
}

export type ShortScheduleTable = string[][]

export interface OfficialRoute {
  id: string
  number: string
  title: string
  category: RouteCategory
  detailPage: string
  shortPage: string
  stopPage: string
  detailRouteId: string
  shortEffectiveDate: string
  detailEffectiveDate: string
  shortTables: ShortScheduleTable[]
  detailedRows: DetailedScheduleRow[]
  stopSections: RouteStopSection[]
}

export interface TransitData {
  generatedAt: string
  officialStops: OfficialStop[]
  routes: OfficialRoute[]
}

export interface NewsItem {
  id: string
  title: string
  date: string
  summary: string
  link: string
  affectedRoutes?: string[]
}
