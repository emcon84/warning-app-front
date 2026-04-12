"use client";

import { useRouter, usePathname } from "next/navigation";
import { Map, Stethoscope, Pill, ShoppingCart, Wrench } from "lucide-react";

const ITEMS = [
  { label: "Mapa",      Icon: Map,          href: "/app",           view: "reports"   },
  { label: "Médicos",   Icon: Stethoscope,  href: "/app",           view: "doctors"   },
  { label: "Farmacias", Icon: Pill,         href: "/app",           view: "farmacias" },
  { label: "Ofertas",   Icon: ShoppingCart, href: "/ofertas",       view: null        },
  { label: "Oficios",   Icon: Wrench,       href: "/profesionales", view: null        },
];

const HIDDEN_PATHS = ["/", "/sign-in", "/sign-up", "/profesional/nuevo", "/profesional/editar"];

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Ocultar en ciertas rutas
  const shouldHide =
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/chat/") ||
    pathname.startsWith("/admin");

  if (shouldHide) return null;

  function handleClick(href: string, view: string | null) {
    if (view) {
      // Guardar vista para que /app la levante al montar
      localStorage.setItem("mapView", view);
    }
    router.push(href);
  }

  function isActive(href: string, view: string | null) {
    if (href === "/app") {
      if (pathname !== "/app") return false;
      if (!view) return false;
      const savedView = typeof window !== "undefined" ? localStorage.getItem("mapView") : null;
      return savedView === view || (!savedView && view === "reports");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1001] bg-gray-900/95 backdrop-blur-md border-t border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {ITEMS.map(({ label, Icon, href, view }) => {
          const active = isActive(href, view);
          return (
            <button
              key={label}
              onClick={() => handleClick(href, view)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0 flex-1"
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  active ? "text-blue-400" : "text-gray-500"
                }`}
              />
              <span
                className={`text-[10px] font-medium leading-none transition-colors ${
                  active ? "text-blue-400" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
