"use client";

type MapView = "all" | "doctors" | "reports";

interface NavbarProps {
  totalReports: number;
  onMenuClick: () => void;
  mapView?: MapView;
  onMapViewChange?: (view: MapView) => void;
  sidebarDisabled?: boolean;
}

const VIEW_CONFIG: Record<MapView, { label: string; mobileLabel: string; emoji: string }> = {
  all:     { label: "Todo",     mobileLabel: "Todo",     emoji: "🗺️" },
  doctors: { label: "Médicos",  mobileLabel: "Médicos",  emoji: "🏥" },
  reports: { label: "Reportes", mobileLabel: "Reportes", emoji: "📢" },
};

export default function Navbar({ totalReports, onMenuClick, mapView = "all", onMapViewChange, sidebarDisabled }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1002] bg-gray-900 text-white shadow-lg">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Hamburguesa */}
        <button
          onClick={sidebarDisabled ? undefined : onMenuClick}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${sidebarDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-800"}`}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Título — oculto en mobile para dar espacio */}
        <h1 className="hidden sm:block text-base font-bold truncate flex-shrink-0">
          Reportes Reconquista
        </h1>

        {/* Pills de vista — centro, todas las pantallas */}
        {onMapViewChange && (
          <div className="flex-1 flex items-center justify-center gap-1">
            {(["all", "doctors", "reports"] as MapView[]).map((view) => {
              const cfg = VIEW_CONFIG[view];
              return (
                <button
                  key={view}
                  onClick={() => onMapViewChange(view)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                    mapView === view
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <span className="sm:hidden">{cfg.emoji} {cfg.mobileLabel}</span>
                  <span className="hidden sm:inline">{cfg.emoji} {cfg.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Contador */}
        <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1.5 rounded-full flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-semibold">{totalReports}</span>
        </div>
      </div>
    </nav>
  );
}
