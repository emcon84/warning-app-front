"use client";

import { Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Wrench, Store, ShoppingCart, Briefcase, MoreHorizontal } from "lucide-react";

const ITEMS = [
  { label: "Oficios",   Icon: Wrench,         href: "/oficios"   },
  { label: "Comercios", Icon: Store,           href: "/comercios" },
  { label: "Ofertas",   Icon: ShoppingCart,   href: "/ofertas"   },
  { label: "Empleos",   Icon: Briefcase,      href: "/empleos"   },
  { label: "Mas",       Icon: MoreHorizontal, href: "/mas"       },
];

const HIDDEN_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/profesional/nuevo",
  "/profesional/editar",
  "/comercio/nuevo",
  "/empleo/nuevo",
];

function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const shouldHide =
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/chat/") ||
    pathname.startsWith("/admin");

  if (shouldHide) return null;

  function isActive(href: string) {
    if (href === "/mas") {
      return pathname === "/mas" || pathname === "/app"
        || pathname.startsWith("/medicos") || pathname.startsWith("/farmacias")
        || pathname.startsWith("/farmacias");
    }
    if (href === "/oficios") return pathname.startsWith("/oficios") || pathname.startsWith("/profesional");
    if (href === "/comercios") return pathname.startsWith("/comercios") || pathname.startsWith("/comercio");
    if (href === "/empleos") return pathname.startsWith("/empleos") || pathname.startsWith("/empleo") || pathname.startsWith("/vacante");
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1001] bg-gray-900/95 backdrop-blur-md border-t border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {ITEMS.map(({ label, Icon, href }) => {
          const active = isActive(href);
          return (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-colors min-w-0 flex-1"
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  active ? "text-blue-400" : "text-gray-500"
                }`}
              />
              <span
                className={`text-[9px] font-medium leading-none transition-colors ${
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

export default function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <Nav />
    </Suspense>
  );
}
