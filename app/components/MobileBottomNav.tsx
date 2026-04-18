"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Map, Stethoscope, Pill, ShoppingCart, Wrench } from "lucide-react";

const ITEMS = [
  { label: "Oficios",   Icon: Wrench,       href: "/profesionales", view: null        },
  { label: "Médicos",   Icon: Stethoscope,  href: "/app",           view: "doctors"   },
  { label: "Farmacias", Icon: Pill,         href: "/app",           view: "farmacias" },
  { label: "Ofertas",   Icon: ShoppingCart, href: "/ofertas",       view: null        },
  { label: "Mapa",      Icon: Map,          href: "/app",           view: "reports"   },
];

const HIDDEN_PATHS = ["/", "/sign-in", "/sign-up", "/profesional/nuevo", "/profesional/editar"];

function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldHide =
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/chat/") ||
    pathname.startsWith("/admin");

  if (shouldHide) return null;

  const currentView = searchParams.get("view") || "reports";

  function handleClick(href: string, view: string | null) {
    if (view) {
      router.push(`${href}?view=${view}`);
    } else {
      router.push(href);
    }
  }

  function isActive(href: string, view: string | null) {
    if (href === "/app") {
      if (pathname !== "/app") return false;
      return (view ?? "reports") === currentView;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Bottom nav */}
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
    </>
  );
}

export default function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <Nav />
    </Suspense>
  );
}
