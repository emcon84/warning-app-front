"use client";

type MapView = "all" | "doctors" | "reports";

interface NavbarProps {
  totalReports: number;
  onMenuClick: () => void;
  mapView?: MapView;
  onMapViewChange?: (view: MapView) => void;
}

export default function Navbar({ totalReports, onMenuClick, mapView = "all", onMapViewChange }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1002] bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Botón hamburguesa */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Nombre de la app */}
        <div className="flex-1 md:flex-none text-center md:text-left">
          <h1 className="text-lg md:text-xl font-bold truncate">
            Reportes Reconquista
          </h1>
        </div>

        {/* Filter pills */}
        {onMapViewChange && (
          <div className="hidden sm:flex items-center gap-1">
            {(["all", "doctors", "reports"] as MapView[]).map((view) => {
              const labels: Record<MapView, string> = { all: "Todo", doctors: "🏥 Médicos", reports: "📢 Reportes" };
              return (
                <button
                  key={view}
                  onClick={() => onMapViewChange(view)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    mapView === view
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {labels[view]}
                </button>
              );
            })}
          </div>
        )}

        {/* Contador de reportes */}
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm md:text-base font-semibold">
            {totalReports}
          </span>
        </div>
      </div>
    </nav>
  );
}
