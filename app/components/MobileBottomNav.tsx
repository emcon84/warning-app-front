"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Map, Stethoscope, Pill, ShoppingCart, Wrench, MessageCircle } from "lucide-react";
import { useChatUnread } from "../hooks/useChatUnread";

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
  const unread = useChatUnread();

  const shouldHide =
    HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/chat/") ||
    pathname.startsWith("/admin");

  if (shouldHide) return null;

  const currentView = searchParams.get("view") || "reports";
  const isChatsActive = pathname === "/chats";

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
      {/* FAB de chats */}
      <div className="md:hidden fixed bottom-20 right-4 z-[1002] flex flex-col items-center gap-1.5">
        <button
          onClick={() => router.push("/chats")}
          className="relative w-11 h-11 flex items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
          aria-label="Mis chats"
        >
          {/* Anillo radar */}
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-40" />
          <MessageCircle className="w-5 h-5 text-white relative z-10" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none border-2 border-gray-950 z-10">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <span className="text-[10px] font-semibold text-blue-400 leading-none">Mis chats</span>
      </div>

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
