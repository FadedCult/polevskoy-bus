import { useState } from "react"
import { ArrowLeft, Clock3, Map, Route as RouteIcon } from "lucide-react"
import Header from "@/components/Header"
import {
  getPreparedDetailedSchedule,
  getRouteCategoryBadge,
  getRouteEffectiveDate,
  getRouteStopSections,
  officialRoutes,
} from "@/data/transitData"
import type { DetailedScheduleRow, OfficialRoute } from "@/types"

function getCellClasses(className: string, isHeader = false) {
  if (isHeader) {
    return "bg-[rgba(52,199,89,0.14)] text-[#333]"
  }

  if (className.includes("day-work")) {
    return "bg-[rgba(52,199,89,0.12)] text-[#23783c]"
  }

  if (className.includes("day-week")) {
    return "bg-[rgba(0,136,255,0.12)] text-[#0a5fb8]"
  }

  if (className.includes("otm")) {
    return "bg-[rgba(51,51,51,0.04)] text-[rgba(51,51,51,0.38)]"
  }

  return "bg-white text-[#333]"
}

function renderCellText(text: string) {
  return text.trim() || "-"
}

function getRouteNumberSize(routeNumber: string) {
  if (routeNumber.length >= 4) return "text-[28px]"
  if (routeNumber.length >= 3) return "text-[34px]"
  return "text-[40px]"
}

function RouteChooser({
  routes,
  onSelect,
}: {
  routes: OfficialRoute[]
  onSelect: (route: OfficialRoute) => void
}) {
  return (
    <>
      <div className="px-4 pt-1 pb-4">
        <h1 className="text-[22px] font-bold text-[#333]" style={{ letterSpacing: "-0.66px" }}>
          Расписание
        </h1>
        <p className="mt-0.5 text-[11px] font-medium text-[rgba(51,51,51,0.75)]" style={{ letterSpacing: "-0.22px" }}>
          Выберите маршрут, чтобы посмотреть официальное расписание
        </p>
      </div>

      <div className="px-4 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => onSelect(route)}
              className="flex h-[88px] items-center justify-center rounded-[18px] bg-[#34C759] px-2 text-center shadow-[0_4px_10px_rgba(52,199,89,0.25)]"
              aria-label={`Открыть маршрут ${route.number}`}
              type="button"
            >
              <span className={`${getRouteNumberSize(route.number)} font-bold leading-none text-white`}>
                {route.number}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function ShortScheduleTables({ route }: { route: OfficialRoute }) {
  return (
    <section className="px-4">
      <div className="rounded-[14px] bg-[#edf4fa] px-4 py-4">
        <div className="flex items-center gap-2">
          <Clock3 size={16} color="#34C759" />
          <h2 className="text-[15px] font-bold text-[#333]">Краткое расписание</h2>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[rgba(51,51,51,0.72)]">
          Основная таблица отправлений с официального сайта.
        </p>

        <div className="mt-3 flex flex-col gap-3">
          {route.shortTables.map((table, tableIndex) => (
            <div
              key={`${route.id}-short-${tableIndex}`}
              className="overflow-hidden rounded-[12px] border border-[rgba(51,51,51,0.12)] bg-white"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-[11px] text-[#333]">
                  <tbody>
                    {table.map((row, rowIndex) => (
                      <tr key={`${route.id}-short-${tableIndex}-row-${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${route.id}-short-${tableIndex}-row-${rowIndex}-cell-${cellIndex}`}
                            className={`border-b border-r border-[rgba(51,51,51,0.08)] px-3 py-2 align-top last:border-r-0 ${
                              rowIndex === 0 ? "bg-[rgba(52,199,89,0.12)] font-semibold" : ""
                            }`}
                          >
                            {cell || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StopSections({ route }: { route: OfficialRoute }) {
  const sections = getRouteStopSections(route)

  if (!sections.length) return null

  return (
    <section className="px-4">
      <div className="rounded-[14px] bg-[#edf4fa] px-4 py-4">
        <div className="flex items-center gap-2">
          <RouteIcon size={16} color="#34C759" />
          <h2 className="text-[15px] font-bold text-[#333]">Остановки по ходу маршрута</h2>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {sections.map((section) => (
            <div key={`${route.id}-${section.title}`} className="rounded-[12px] bg-white px-3 py-3">
              <p className="text-[11px] font-semibold text-[#333]">{section.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {section.stops.map((stop) => (
                  <span
                    key={`${route.id}-${section.title}-${stop}`}
                    className="rounded-full bg-[#edf4fa] px-3 py-1 text-[10px] font-medium text-[#333]"
                  >
                    {stop}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DetailedHeaderRows({
  route,
  rows,
}: {
  route: OfficialRoute
  rows: DetailedScheduleRow[]
}) {
  if (!rows.length) return null

  return (
    <thead>
      {rows.map((row, rowIndex) => (
        <tr key={`${route.id}-head-${rowIndex}`}>
          {row.cells.map((cell, cellIndex) => (
            <th
              key={`${route.id}-head-${rowIndex}-${cellIndex}`}
              className={`min-w-[56px] border-b border-r border-[rgba(51,51,51,0.08)] px-2 py-2 text-center text-[10px] font-semibold last:border-r-0 ${
                cellIndex === 0 ? "sticky left-0 z-20 min-w-[160px]" : ""
              } ${getCellClasses(cell.className, true)}`}
            >
              {renderCellText(cell.text)}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )
}

function DetailedSchedule({ route }: { route: OfficialRoute }) {
  const detailedSchedule = getPreparedDetailedSchedule(route)

  if (!detailedSchedule.hasUsableTimes) {
    return null
  }

  return (
    <section className="px-4">
      <div className="rounded-[14px] bg-[#edf4fa] px-4 py-4">
        <h2 className="text-[15px] font-bold text-[#333]">Подробная таблица по остановкам</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[rgba(51,51,51,0.72)]">
          Таблица прокручивается по горизонтали. Первая колонка закреплена для удобства чтения.
        </p>

        <div className="mt-3 overflow-hidden rounded-[12px] border border-[rgba(51,51,51,0.12)] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-max border-separate border-spacing-0 text-[10px] text-[#333]">
              <DetailedHeaderRows route={route} rows={detailedSchedule.headerRows} />
              <tbody>
                {detailedSchedule.bodyRows.map((row, rowIndex) => (
                  <tr key={`${route.id}-body-${rowIndex}`}>
                    <th className="sticky left-0 z-10 min-w-[160px] border-b border-r border-[rgba(51,51,51,0.08)] bg-[#edf4fa] px-3 py-2 text-left text-[10px] font-semibold text-[#333]">
                      {row.stopName}
                    </th>
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`${route.id}-body-${rowIndex}-cell-${cellIndex}`}
                        className={`min-w-[56px] border-b border-r border-[rgba(51,51,51,0.08)] px-2 py-2 text-center last:border-r-0 ${getCellClasses(cell.className)}`}
                      >
                        {renderCellText(cell.text)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function RouteDetails({
  route,
  onBack,
  onOpenMap,
}: {
  route: OfficialRoute
  onBack: () => void
  onOpenMap: (routeNumber: string) => void
}) {
  const effectiveDate = getRouteEffectiveDate(route)

  return (
    <>
      <div className="px-4 pt-1 pb-4">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 rounded-full bg-[#edf4fa] px-3 py-2 text-[11px] font-semibold text-[#333]"
          type="button"
        >
          <ArrowLeft size={15} />
          К списку маршрутов
        </button>

        <div className="rounded-[16px] bg-[#edf4fa] px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#34C759] px-3 py-1 text-[11px] font-bold text-white">
              Маршрут {route.number}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#333]">
              {getRouteCategoryBadge(route.category)}
            </span>
            <button
              onClick={() => onOpenMap(route.number)}
              className="ml-auto flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-[#333]"
              type="button"
            >
              <Map size={14} color="#34C759" />
              Открыть на карте
            </button>
          </div>
          <h1 className="mt-3 text-[22px] font-bold leading-tight text-[#333]">
            {route.title}
          </h1>
          <p className="mt-2 text-[11px] leading-relaxed text-[rgba(51,51,51,0.74)]">
            Официальные таблицы и перечень остановок загружены с polevskoybus.ru.
          </p>
          {effectiveDate ? (
            <p className="mt-2 text-[10px] font-medium text-[rgba(51,51,51,0.6)]">
              Дата расписания: {effectiveDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-5">
        <ShortScheduleTables route={route} />
        <StopSections route={route} />
        <DetailedSchedule route={route} />
      </div>
    </>
  )
}

export default function RoutesPage({ onOpenRouteMap }: { onOpenRouteMap: (routeNumber: string) => void }) {
  const [selectedRoute, setSelectedRoute] = useState<OfficialRoute | null>(null)

  return (
    <div className="min-h-full bg-[#d9d9d9]">
      <Header city="Полевской" />
      {selectedRoute ? (
        <RouteDetails route={selectedRoute} onBack={() => setSelectedRoute(null)} onOpenMap={onOpenRouteMap} />
      ) : (
        <RouteChooser routes={officialRoutes} onSelect={setSelectedRoute} />
      )}
    </div>
  )
}
