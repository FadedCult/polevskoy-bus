import { useEffect, useRef, useState } from "react"
import { ListFilter, LocateFixed, RefreshCw, X } from "lucide-react"
import L from "leaflet"
import type { CircleMarker, LayerGroup, Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"
import Header from "@/components/Header"
import { routeNumbers } from "@/data/transitData"
import { getActiveRouteGeojson } from "@/data/routeGeojson"

const polevskoyCenter: [number, number] = [56.443, 60.187]
const defaultZoom = 12.5
const trackedZoom = 15.5
const mapHeight = "calc(100dvh - 266px)"

interface MapPageProps {
  isActive?: boolean
  selectedRouteNumbers: string[]
  onSelectedRouteNumbersChange: (routeNumbers: string[]) => void
}

export default function MapPage({
  isActive = true,
  selectedRouteNumbers,
  onSelectedRouteNumbersChange,
}: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<CircleMarker | null>(null)
  const routeLayersRef = useRef<LayerGroup | null>(null)
  const markerPositionRef = useRef<[number, number] | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const autoLocateStartedRef = useRef(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied" | "error">("idle")

  const allRoutesSelected = selectedRouteNumbers.length === routeNumbers.length
  const selectedRouteSet = new Set(selectedRouteNumbers)

  const renderRouteLayers = () => {
    const routeLayerGroup = routeLayersRef.current
    if (!routeLayerGroup) return

    routeLayerGroup.clearLayers()

    for (const routeGeojson of getActiveRouteGeojson(selectedRouteNumbers)) {
      const layer = L.geoJSON(routeGeojson.data as never, {
        style: () => ({
          color: routeGeojson.stroke ?? "#34C759",
          weight: 4,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }),
      })

      routeLayerGroup.addLayer(layer)
    }
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: polevskoyCenter,
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: false,
    })

    mapRef.current = map
    routeLayersRef.current = L.layerGroup().addTo(map)
    renderRouteLayers()

    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      subdomains: ["a", "b", "c"],
      maxZoom: 19,
      crossOrigin: true,
    })

    tileLayer.addTo(map)

    const resizeMap = () => map.invalidateSize()
    const observer = new ResizeObserver(resizeMap)
    observer.observe(mapContainerRef.current)

    resizeMap()
    requestAnimationFrame(resizeMap)
    setTimeout(resizeMap, 250)

    tileLayer.on("load", () => {
      resizeMap()
      requestAnimationFrame(resizeMap)
      setTimeout(resizeMap, 250)
    })

    tileLayer.on("tileerror", (event) => {
      console.error("Leaflet tile error", event)
    })

    return () => {
      observer.disconnect()

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      routeLayersRef.current?.remove()
      routeLayersRef.current = null
      markerRef.current?.remove()
      markerRef.current = null
      markerPositionRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    renderRouteLayers()
  }, [selectedRouteNumbers])

  const ensureMarker = (latLng: [number, number]) => {
    const map = mapRef.current
    if (!map) return null

    if (!markerRef.current) {
      markerRef.current = L.circleMarker(latLng, {
        radius: 9,
        color: "rgba(255,255,255,0.92)",
        weight: 3,
        fillColor: "#FF383C",
        fillOpacity: 1,
      }).addTo(map)
    } else {
      markerRef.current.setLatLng(latLng)
    }

    markerPositionRef.current = latLng
    return markerRef.current
  }

  const animateLocationUpdate = (nextLatLng: [number, number]) => {
    const marker = markerRef.current
    const startLatLng = markerPositionRef.current

    if (!marker || !startLatLng) return

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const duration = 900
    const startTime = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const lat = startLatLng[0] + (nextLatLng[0] - startLatLng[0]) * progress
      const lng = startLatLng[1] + (nextLatLng[1] - startLatLng[1]) * progress
      const currentLatLng: [number, number] = [lat, lng]

      marker.setLatLng(currentLatLng)
      markerPositionRef.current = currentLatLng

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step)
        return
      }

      marker.setLatLng(nextLatLng)
      markerPositionRef.current = nextLatLng
      animationFrameRef.current = null
    }

    animationFrameRef.current = requestAnimationFrame(step)
  }

  const startLocationWatch = () => {
    if (!navigator.geolocation || watchIdRef.current !== null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLatLng: [number, number] = [position.coords.latitude, position.coords.longitude]
        const map = mapRef.current

        if (!map) return

        if (!markerRef.current) {
          ensureMarker(nextLatLng)
        }

        animateLocationUpdate(nextLatLng)
        setLocationState("ready")
      },
      (error) => {
        setLocationState(error.code === 1 ? "denied" : "error")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const requestLocation = async (centerCamera = true) => {
    if (!navigator.geolocation) {
      setLocationState("error")
      return
    }

    setLocationState("loading")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const latLng: [number, number] = [position.coords.latitude, position.coords.longitude]
      const map = mapRef.current

      if (map && centerCamera) {
        map.flyTo(latLng, trackedZoom, { duration: 1.2 })
      }

      ensureMarker(latLng)
      setLocationState("ready")
      startLocationWatch()
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? (error as GeolocationPositionError).code
          : 0

      setLocationState(code === 1 ? "denied" : "error")
    }
  }

  useEffect(() => {
    const map = mapRef.current
    if (!isActive || !map) return

    const resizeMap = () => map.invalidateSize()
    resizeMap()
    requestAnimationFrame(resizeMap)
    setTimeout(resizeMap, 250)

    if (!autoLocateStartedRef.current) {
      autoLocateStartedRef.current = true
      requestLocation(false)
    }
  }, [isActive])

  const toggleRoute = (routeNumber: string) => {
    if (selectedRouteSet.has(routeNumber)) {
      onSelectedRouteNumbersChange(selectedRouteNumbers.filter((value) => value !== routeNumber))
      return
    }

    onSelectedRouteNumbersChange(
      routeNumbers.filter((value) => value === routeNumber || selectedRouteSet.has(value)),
    )
  }

  const selectedRoutesLabel = allRoutesSelected
    ? "Все маршруты"
    : selectedRouteNumbers.length
      ? `Выбрано: ${selectedRouteNumbers.length}`
      : "Все скрыты"

  return (
    <div className="relative flex min-h-full flex-col bg-[#d9d9d9]">
      <Header city="Полевской" />

      <div className="px-4 pt-1 pb-3">
        <h1 className="text-[22px] font-bold text-[#333]" style={{ letterSpacing: "-0.66px" }}>
          Карта
        </h1>
      </div>

      <div className="px-4 pb-3">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex w-full items-center justify-between rounded-[14px] bg-white px-4 py-3 text-left shadow-[0px_3px_10px_rgba(0,0,0,0.08)]"
          type="button"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#333]">Фильтр маршрутов</p>
            <p className="mt-0.5 text-[11px] text-[rgba(51,51,51,0.68)]">{selectedRoutesLabel}</p>
          </div>
          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[rgba(52,199,89,0.12)]">
            <ListFilter size={16} color="#34C759" />
          </div>
        </button>
      </div>

      <div
        className="mx-4 mb-4 overflow-hidden rounded-[14px] border border-[rgba(51,51,51,0.75)] shadow-[0px_4px_5px_0px_rgba(0,0,0,0.2)]"
        style={{ height: mapHeight, minHeight: "340px" }}
      >
        <div className="relative h-full">
          <div ref={mapContainerRef} className="absolute inset-0 bg-[#d9d9d9]" />

          <div className="absolute right-3 top-3 z-[500]">
            <button
              onClick={() => requestLocation(true)}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15)]"
              aria-label="Определить мое местоположение"
              type="button"
            >
              {locationState === "loading" ? (
                <RefreshCw size={16} className="animate-spin text-[#333]" />
              ) : (
                <LocateFixed size={16} color="#333" strokeWidth={1.9} />
              )}
            </button>
          </div>
        </div>
      </div>

      {isFilterOpen ? (
        <div className="absolute inset-0 z-[900] flex flex-col bg-[rgba(217,217,217,0.98)] backdrop-blur-sm">
          <Header city="Полевской" />

          <div className="flex items-center justify-between px-4 pt-1 pb-3">
            <div>
              <h2 className="text-[22px] font-bold text-[#333]" style={{ letterSpacing: "-0.66px" }}>
                Маршруты
              </h2>
              <p className="mt-0.5 text-[11px] text-[rgba(51,51,51,0.7)]">
                Можно выбрать один, несколько или сразу все
              </p>
            </div>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.08)]"
              aria-label="Закрыть фильтр маршрутов"
              type="button"
            >
              <X size={18} color="#333" />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => onSelectedRouteNumbersChange(routeNumbers)}
                className="flex-1 rounded-[12px] bg-[#34C759] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(52,199,89,0.22)]"
                type="button"
              >
                Выбрать все
              </button>
              <button
                onClick={() => onSelectedRouteNumbersChange([])}
                className="flex-1 rounded-[12px] bg-white px-4 py-3 text-[12px] font-semibold text-[#333] shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                type="button"
              >
                Убрать все
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-5">
            <div className="grid grid-cols-3 gap-3">
              {routeNumbers.map((routeNumber) => {
                const isSelected = selectedRouteSet.has(routeNumber)

                return (
                  <button
                    key={routeNumber}
                    onClick={() => toggleRoute(routeNumber)}
                    className={`flex h-[84px] items-center justify-center rounded-[18px] border px-2 text-center shadow-[0_4px_10px_rgba(0,0,0,0.06)] ${
                      isSelected
                        ? "border-[#34C759] bg-[#34C759] text-white shadow-[0_4px_10px_rgba(52,199,89,0.25)]"
                        : "border-[rgba(51,51,51,0.08)] bg-white text-[#333]"
                    }`}
                    type="button"
                  >
                    <span className="text-[30px] font-bold leading-none">{routeNumber}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
