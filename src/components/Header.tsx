import { Bell, MapPin } from "lucide-react"

interface HeaderProps {
  city?: string
}

export default function Header({ city = "Полевской" }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <div className="flex items-center gap-1.5">
        <MapPin size={14} color="#333333" fill="#333333" strokeWidth={0} />
        <span
          className="text-[13px] font-bold text-[#333]"
          style={{ letterSpacing: "-0.55px" }}
        >
          {city}
        </span>
      </div>
      <Bell size={22} color="#333333" strokeWidth={1.8} />
    </div>
  )
}
