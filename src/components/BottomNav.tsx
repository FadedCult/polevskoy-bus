import type { ReactNode } from "react"
import type { Page } from "@/types"
import BusIcon from "@/components/BusIcon"
import svgPaths from "@/imports/Home/svg-2emaajx1tv"

interface BottomNavProps {
  current: Page
  onChange: (page: Page) => void
}

function MapNavIcon({ color }: { color: string }) {
  return (
    <svg width={28} height={25} viewBox="0 0 65 58" fill="none">
      <path
        d={svgPaths.p33a82b00}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  )
}

function HomeNavIcon({ color }: { color: string }) {
  return (
    <svg width={26} height={26} viewBox="0 0 59 59" fill="none">
      <path
        d={svgPaths.p1a4c6520}
        stroke={color}
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  )
}

function ProfileNavIcon({ color }: { color: string }) {
  return (
    <svg width={26} height={26} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <circle cx="30" cy="30" r="26.5" stroke={color} strokeWidth="3" />
      <circle cx="30" cy="22" r="8.5" stroke={color} strokeWidth="2.8" />
      <path
        d="M12 50C14.8 42.8 21 38.5 30 38.5C39 38.5 45.2 42.8 48 50"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.8"
      />
    </svg>
  )
}

interface NavItemProps {
  label: string
  page: Page
  current: Page
  onChange: (page: Page) => void
  icon: (color: string) => ReactNode
}

function NavItem({ label, page, current, onChange, icon }: NavItemProps) {
  const active = current === page
  const color = active ? "#34C759" : "#333333"

  return (
    <button
      onClick={() => onChange(page)}
      className="flex flex-1 flex-col items-center gap-1 pt-3 pb-2"
    >
      {icon(color)}
      <span
        className="text-[10px] leading-none"
        style={{
          color,
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </span>
    </button>
  )
}

export default function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center" style={{ zIndex: 50 }}>
      <div
        className="flex w-full max-w-[390px] bg-[#fefefe]"
        style={{
          borderRadius: "20px 20px 0 0",
          boxShadow: "0px -4px 5px 0px rgba(51,51,51,0.2)",
          height: "72px",
        }}
      >
        <NavItem
          label="Главная"
          page="home"
          current={current}
          onChange={onChange}
          icon={(color) => <HomeNavIcon color={color} />}
        />
        <NavItem
          label="Маршруты"
          page="routes"
          current={current}
          onChange={onChange}
          icon={(color) => <BusIcon size={26} color={color} />}
        />
        <NavItem
          label="Карта"
          page="map"
          current={current}
          onChange={onChange}
          icon={(color) => <MapNavIcon color={color} />}
        />
        <NavItem
          label="Профиль"
          page="profile"
          current={current}
          onChange={onChange}
          icon={(color) => <ProfileNavIcon color={color} />}
        />
      </div>
    </div>
  )
}
