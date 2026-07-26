import { useEffect, useRef, useState } from "react"
import { LocateFixed, MapPin, Navigation, RefreshCw } from "lucide-react"
import L from "leaflet"
import type { CircleMarker, Map as LeafletMap, TileLayer } from "leaflet"
import "leaflet/dist/leaflet.css"
import Header from "@/components/Header"

const polevskoyCenter: [number, number] = [56.443, 60.187]
const defaultZoom = 12.5

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const markerRef = useRef<CircleMarker | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied" | "error">("idle")
  const [statusText, setStatusText] = useState("")

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: polevskoyCenter,
      zoom: defaultZoom,
      zoomControl: false,
      attributionControl: false,
    })

    mapRef.current = map

    const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      subdomains: ["a", "b", "c"],
      maxZoom: 19,
      crossOrigin: true,
    })

    tileLayerRef.current = tileLayer
    tileLayer.addTo(map)

    const resizeMap = () => map.invalidateSize()
    const observer = new ResizeObserver(resizeMap)
    observer.observe(mapContainerRef.current)

    tileLayer.on("load", () => {
      setMapReady(true)
      setStatusText("")
      resizeMap()
      requestAnimationFrame(resizeMap)
      setTimeout(resizeMap, 250)
    })

    tileLayer.on("tileerror", (event) => {
      console.error("Leaflet tile error", event)
      setStatusText("Не удалось загрузить слой карты")
    })

    return () => {
      observer.disconnect()
      markerRef.current?.remove()
      markerRef.current = null
      tileLayerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  const requestLocation = async () => {
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

      if (map) {
        map.flyTo(latLng, 15.5, { duration: 1.2 })
      }

      markerRef.current?.remove()
      if (map) {
        markerRef.current = L.circleMarker(latLng, {
          radius: 9,
          color: "rgba(255,255,255,0.92)",
          weight: 3,
          fillColor: "#FF383C",
          fillOpacity: 1,
        }).addTo(map)
      }

      setLocationState("ready")
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? (error as GeolocationPositionError).code
          : 0

      setLocationState(code === 1 ? "denied" : "error")
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-[#d9d9d9]">
      <Header city="Полевской" />

      <div className="px-4 pt-1 pb-3">
        <h1 className="text-[22px] font-bold text-[#333]" style={{ letterSpacing: "-0.66px" }}>
          Карта
        </h1>
        <p className="mt-0.5 text-[11px] font-medium text-[rgba(51,51,51,0.75)]" style={{ letterSpacing: "-0.22px" }}>
          Открытая карта OpenStreetMap с определением вашего местоположения
        </p>
      </div>

      <div
        className="mx-4 overflow-hidden rounded-[14px] border border-[rgba(51,51,51,0.75)] shadow-[0px_4px_5px_0px_rgba(0,0,0,0.2)]"
        style={{ height: "calc(100dvh - 188px)", minHeight: "520px" }}
      >
        <div className="relative h-full">
          <div ref={mapContainerRef} className="absolute inset-0 bg-[#d9d9d9]" />

          <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[85%] rounded-[14px] bg-white/92 px-3 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[rgba(255,56,60,0.10)]">
                <MapPin size={18} color="#FF383C" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#333]">OpenStreetMap</p>
                <p className="text-[10px] leading-snug text-[rgba(51,51,51,0.7)]">
                  {statusText || (mapReady ? "Карта готова к работе" : "Загрузка карты...")}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
            <button
              onClick={requestLocation}
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
            <button
              onClick={() => mapRef.current?.flyTo(polevskoyCenter, defaultZoom, { duration: 0.9 })}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.15)]"
              aria-label="Вернуть карту к Полевскому"
              type="button"
            >
              <Navigation size={16} color="#333" strokeWidth={1.9} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
