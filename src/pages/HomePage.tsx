import { useMemo, useState } from "react"
import {
  ArrowUpDown,
  Calendar,
  ChevronDown,
  Clock,
  Map,
  MapPin,
  Search,
  X,
} from "lucide-react"
import Header from "@/components/Header"
import BusIcon from "@/components/BusIcon"
import newsImage from "@/imports/Home/15fc7b6b9998534ffea31c0c5140c926d7005e4a.png"
import { news } from "@/data/mockData"
import { getStopSecondaryText, officialStops } from "@/data/transitData"
import type { OfficialStop } from "@/types"

type StopField = "from" | "to"

const availableStops = officialStops
const latestNews = news[0]

function formatDate(value: string) {
  if (!value) return "Сегодня"

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T12:00:00`))
}

function createTodayValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, "0")
  const day = `${today.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function StopPicker({
  field,
  query,
  selectedStopId,
  onQueryChange,
  onSelect,
  onClose,
}: {
  field: StopField
  query: string
  selectedStopId: string
  onQueryChange: (value: string) => void
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const filteredStops = useMemo(
    () =>
      availableStops.filter((stop) =>
        [stop.name, stop.address, stop.direction]
          .join(" ")
          .toLocaleLowerCase("ru-RU")
          .includes(query.toLocaleLowerCase("ru-RU")),
      ),
    [query],
  )

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/25"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[390px] bg-[#edf4fa] px-4 pt-4 pb-7"
        style={{
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.16)",
        }}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={
          field === "from"
            ? "Выбор остановки отправления"
            : "Выбор остановки прибытия"
        }
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[16px] font-bold text-[#333]">
            {field === "from" ? "Откуда" : "Куда"}
          </p>
          <button onClick={onClose} className="p-1" aria-label="Закрыть выбор остановки">
            <X size={20} color="#333" />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-[9px] border border-[rgba(51,51,51,0.45)] bg-white px-3">
          <Search size={16} color="#333" />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск остановки"
            className="h-[40px] min-w-0 flex-1 bg-transparent text-[13px] text-[#333] outline-none placeholder:text-[rgba(51,51,51,0.55)]"
          />
        </div>
        <div className="mt-3 max-h-[50vh] overflow-y-auto">
          {filteredStops.length ? (
            filteredStops.map((stop) => {
              const secondaryText = getStopSecondaryText(stop)

              return (
                <button
                  key={stop.id}
                  onClick={() => onSelect(stop.id)}
                  className="flex w-full items-start gap-3 border-b border-[rgba(51,51,51,0.15)] px-2 py-3 text-left last:border-b-0"
                >
                  <MapPin
                    size={16}
                    color={stop.id === selectedStopId ? "#34C759" : "#333"}
                  />
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-[#333]">{stop.name}</span>
                    {secondaryText ? (
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[rgba(51,51,51,0.65)]">
                        {secondaryText}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-[rgba(51,51,51,0.58)]">
                      Маршрутов: {stop.routes.length}
                    </p>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="py-6 text-center text-[13px] text-[rgba(51,51,51,0.75)]">
              Остановка не найдена
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StopSummary({
  label,
  stop,
  placeholder,
  onClick,
}: {
  label: string
  stop: OfficialStop | null
  placeholder: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="block w-full text-left">
      <p
        className="text-[10px] font-light text-[rgba(51,51,51,0.75)]"
        style={{ letterSpacing: "-0.33px" }}
      >
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-semibold text-[#333]" style={{ letterSpacing: "-0.33px" }}>
        {stop?.name || placeholder}
      </p>
      <p className="mt-1 min-h-[24px] text-[10px] leading-relaxed text-[rgba(51,51,51,0.68)]">
        {stop ? getStopSecondaryText(stop) || "Официальная остановка из справочника" : "Выберите остановку из официального списка"}
      </p>
    </button>
  )
}

function SearchCard({ onRoutes }: { onRoutes: () => void }) {
  const [fromId, setFromId] = useState("")
  const [toId, setToId] = useState("")
  const [activeField, setActiveField] = useState<StopField | null>(null)
  const [query, setQuery] = useState("")
  const [date, setDate] = useState(createTodayValue())
  const [time, setTime] = useState("")

  const fromStop = useMemo(
    () => availableStops.find((stop) => stop.id === fromId) ?? null,
    [fromId],
  )
  const toStop = useMemo(
    () => availableStops.find((stop) => stop.id === toId) ?? null,
    [toId],
  )

  const selectStop = (id: string) => {
    if (activeField === "from") setFromId(id)
    if (activeField === "to") setToId(id)
    setActiveField(null)
  }

  return (
    <>
      <div
        className="mx-4 mt-3 bg-[#edf4fa]"
        style={{ borderRadius: "14px", padding: "14px" }}
      >
        <div className="relative pr-10">
          <div className="absolute left-0 top-0 flex flex-col items-center" style={{ height: "104px" }}>
            <div className="mt-[16px]">
              <div
                className="h-[10px] w-[10px] rounded-full bg-[#34C759]"
                style={{ boxShadow: "0 0 0 3px rgba(52,199,89,0.35)" }}
              />
            </div>
            <div className="flex flex-1 justify-center py-1">
              <svg width="3" height="58">
                <path
                  d="M1.5 0 V58"
                  stroke="rgba(51,51,51,0.75)"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mb-[16px]">
              <div
                className="h-[10px] w-[10px] rounded-full bg-[#FF383C]"
                style={{ boxShadow: "0 0 0 3px rgba(255,56,60,0.35)" }}
              />
            </div>
          </div>

          <div className="border-b border-[rgba(51,51,51,0.75)] pb-3 pl-6">
            <StopSummary
              label="Откуда"
              stop={fromStop}
              placeholder="Выберите остановку"
              onClick={() => {
                setActiveField("from")
                setQuery("")
              }}
            />
          </div>
          <div className="pt-3 pl-6">
            <StopSummary
              label="Куда"
              stop={toStop}
              placeholder="Выберите остановку"
              onClick={() => {
                setActiveField("to")
                setQuery("")
              }}
            />
          </div>
          <button
            onClick={() => {
              setFromId(toId)
              setToId(fromId)
            }}
            aria-label="Поменять остановки местами"
            className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "11px",
              border: "1px solid rgba(51,51,51,0.75)",
            }}
          >
            <ArrowUpDown size={13} color="rgba(51,51,51,0.75)" />
          </button>
        </div>

        <div className="mt-3 flex items-center border-t border-[rgba(51,51,51,0.75)] pt-3 pb-1">
          <label className="relative flex flex-1 cursor-pointer items-center gap-1">
            <Calendar size={11} color="#333" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold text-[#333]" style={{ letterSpacing: "-0.77px" }}>
              {formatDate(date)}
            </span>
            <ChevronDown size={9} color="#333" strokeWidth={2} />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Дата поездки"
            />
          </label>
          <label className="relative flex flex-1 cursor-pointer items-center gap-1">
            <Clock size={11} color="#333" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold text-[#333]" style={{ letterSpacing: "-0.77px" }}>
              {time || "Сейчас"}
            </span>
            <ChevronDown size={9} color="#333" strokeWidth={2} />
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Время поездки"
            />
          </label>
        </div>

        <button
          onClick={onRoutes}
          className="mt-3 flex w-full items-center justify-center gap-2 bg-[#1a1a1a]"
          style={{ borderRadius: "9px", height: "38px" }}
        >
          <Search size={15} color="#e6e6e6" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-[#e6e6e6]" style={{ letterSpacing: "-0.33px" }}>
            Открыть расписание маршрутов
          </span>
        </button>
      </div>
      {activeField ? (
        <StopPicker
          field={activeField}
          query={query}
          selectedStopId={activeField === "from" ? fromId : toId}
          onQueryChange={setQuery}
          onSelect={selectStop}
          onClose={() => setActiveField(null)}
        />
      ) : null}
    </>
  )
}

function QuickCards({
  onRoutes,
  onMap,
}: {
  onRoutes: () => void
  onMap: () => void
}) {
  const cardStyle = {
    borderRadius: "14px",
    border: "1px solid rgba(51,51,51,0.75)",
    boxShadow: "0px 4px 5px 0px rgba(0,0,0,0.2)",
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-3 px-4">
      <button onClick={onRoutes} className="flex flex-col items-center bg-[#edf4fa] pt-3 pb-3" style={cardStyle}>
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(52,199,89,0.15)" }}
        >
          <BusIcon size={20} color="#333333" />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-[#333]" style={{ letterSpacing: "-0.33px" }}>
          Маршруты
        </p>
        <p className="mt-0.5 px-1 text-center text-[9px] font-light leading-tight text-[rgba(51,51,51,0.75)]" style={{ letterSpacing: "-0.55px" }}>
          Все официальные рейсы города и пригородов
        </p>
      </button>
      <button onClick={onRoutes} className="flex flex-col items-center bg-[#edf4fa] pt-3 pb-3" style={cardStyle}>
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(0,136,255,0.10)" }}
        >
          <Clock size={19} color="#0088FF" strokeWidth={1.8} />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-[#333]" style={{ letterSpacing: "-0.33px" }}>
          Расписание
        </p>
        <p className="mt-0.5 px-1 text-center text-[9px] font-light leading-tight text-[rgba(51,51,51,0.75)]" style={{ letterSpacing: "-0.55px" }}>
          Короткие и подробные таблицы с polevskoybus.ru
        </p>
      </button>
      <button onClick={onMap} className="flex flex-col items-center bg-[#edf4fa] pt-3 pb-3" style={cardStyle}>
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,56,60,0.10)" }}
        >
          <Map size={19} color="#FF383C" strokeWidth={1.8} />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-[#333]" style={{ letterSpacing: "-0.33px" }}>
          Остановки
        </p>
        <p className="mt-0.5 px-1 text-center text-[9px] font-light leading-tight text-[rgba(51,51,51,0.75)]" style={{ letterSpacing: "-0.55px" }}>
          Полный официальный список в порядке сайта
        </p>
      </button>
    </div>
  )
}

function NewsSection({ onOpen }: { onOpen: () => void }) {
  if (!latestNews) return null

  return (
    <div className="mt-5 mb-4 px-4">
      <h2 className="mb-3 text-[22px] font-bold text-[#333]" style={{ letterSpacing: "-1.1px" }}>
        Новости перевозчика
      </h2>
      <button
        onClick={onOpen}
        className="block w-full overflow-hidden bg-[#edf4fa] text-left"
        style={{
          borderRadius: "14px",
          border: "1px solid rgba(51,51,51,0.75)",
          boxShadow: "0px 4px 5px 0px rgba(0,0,0,0.2)",
        }}
      >
        <div className="overflow-hidden" style={{ borderRadius: "14px 14px 0 0", height: "140px" }}>
          <img src={newsImage} alt="Новости перевозчика" className="h-full w-full object-cover" />
        </div>
        <div className="p-3 pt-3">
          <p className="text-[11px] text-[rgba(51,51,51,0.65)]">{latestNews.date}</p>
          <p className="mt-1 text-[14px] font-normal text-[#333]" style={{ letterSpacing: "-0.73px", lineHeight: "1.2" }}>
            {latestNews.title}
          </p>
        </div>
      </button>
    </div>
  )
}

interface HomePageProps {
  onRoutes: () => void
  onMap: () => void
}

export default function HomePage({ onRoutes, onMap }: HomePageProps) {
  const [isNewsOpen, setIsNewsOpen] = useState(false)

  return (
    <div className="min-h-full bg-[#d9d9d9]">
      <Header city="Полевской" />
      <div className="px-4 pt-1">
        <h1 className="text-[22px] font-bold text-[#333]" style={{ letterSpacing: "-0.66px" }}>
          Куда едем?
        </h1>
        <p className="mt-0.5 text-[11px] font-medium text-[rgba(51,51,51,0.75)]" style={{ letterSpacing: "-0.22px" }}>
          Выбирайте остановки из официального справочника и переходите к расписанию нужного маршрута
        </p>
      </div>
      <SearchCard onRoutes={onRoutes} />
      <QuickCards onRoutes={onRoutes} onMap={onMap} />
      <NewsSection onOpen={() => setIsNewsOpen(true)} />
      {isNewsOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30"
          onMouseDown={() => setIsNewsOpen(false)}
        >
          <article
            className="max-h-[88dvh] w-full max-w-[390px] overflow-y-auto bg-[#edf4fa] pb-8"
            style={{ borderRadius: "20px 20px 0 0" }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Новости перевозчика"
          >
            <div className="sticky top-0 z-10 flex justify-end bg-[#edf4fa] px-4 pt-3">
              <button
                onClick={() => setIsNewsOpen(false)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white"
                aria-label="Закрыть новости"
              >
                <X size={18} color="#333" />
              </button>
            </div>
            <img src={newsImage} alt="Новость перевозчика" className="mt-1 h-[180px] w-full object-cover" />
            <div className="px-4 pt-4">
              {latestNews ? (
                <>
                  <p className="text-[11px] text-[rgba(51,51,51,0.75)]">{latestNews.date}</p>
                  <h2 className="mt-2 text-[20px] font-bold leading-tight text-[#333]">
                    {latestNews.title}
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-[#333]">
                    {latestNews.summary}
                  </p>
                  {latestNews.affectedRoutes?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {latestNews.affectedRoutes.map((route) => (
                        <span
                          key={route}
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#333]"
                        >
                          Маршрут {route}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}

              <div className="mt-6">
                <h3 className="text-[15px] font-bold text-[#333]">Ещё недавние новости</h3>
                <div className="mt-3 flex flex-col gap-3">
                  {news.slice(1).map((item) => (
                    <div key={item.id} className="rounded-[12px] bg-white px-3 py-3">
                      <p className="text-[10px] text-[rgba(51,51,51,0.6)]">{item.date}</p>
                      <p className="mt-1 text-[13px] font-semibold text-[#333]">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[rgba(51,51,51,0.8)]">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  )
}
