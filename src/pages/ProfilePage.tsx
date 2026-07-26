import Header from "@/components/Header"

interface MenuItemProps {
  label: string
  subtitle?: string
}

function MenuItem({ label, subtitle }: MenuItemProps) {
  return (
    <div className="px-10 py-4">
      <p className="text-[12px] font-semibold text-[#333]" style={{ letterSpacing: "-0.33px" }}>
        {label}
      </p>
      {subtitle ? (
        <p
          className="mt-0.5 text-[11px] font-semibold leading-snug text-[rgba(51,51,51,0.75)]"
          style={{ letterSpacing: "-0.33px" }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

function Divider() {
  return (
    <div className="mx-10">
      <div className="h-px bg-[rgba(51,51,51,0.75)]" />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-[#d9d9d9]">
      <Header city="Полевской" />

      <div className="px-4 pt-1 pb-4">
        <h1 className="text-[22px] font-bold leading-snug text-[#333]" style={{ letterSpacing: "-0.66px" }}>
          Пассажиру
        </h1>
        <p className="mt-0.5 text-[11px] font-medium text-[rgba(51,51,51,0.75)]">
          Быстрый доступ к полезным разделам сервиса
        </p>
      </div>

      <div className="mx-4 bg-[#edf4fa]" style={{ borderRadius: "14px", minHeight: "380px" }}>
        <MenuItem
          label="История маршрутов"
          subtitle="Развитие маршрутной сети города и автобусного движения"
        />
        <Divider />
        <MenuItem
          label="Перевозчики"
          subtitle="Пассажирские транспортные компании и справочная информация"
        />
        <Divider />
        <MenuItem
          label="Тарифы"
          subtitle="Стоимость проезда и провоза багажа по направлениям"
        />
        <Divider />
        <MenuItem
          label="Правила"
          subtitle="Правила пользования автобусом и перевозки пассажиров"
        />
        <Divider />
      </div>

      <div className="mt-6 mb-6 flex justify-center">
        <button
          className="flex items-center justify-center"
          style={{
            backgroundColor: "rgba(60,60,67,0.2)",
            borderRadius: "9px",
            width: "170px",
            height: "33px",
          }}
        >
          <span
            className="text-[14px] font-bold"
            style={{
              color: "rgba(255,56,60,0.75)",
              letterSpacing: "-0.73px",
            }}
          >
            Обратная связь
          </span>
        </button>
      </div>
    </div>
  )
}
