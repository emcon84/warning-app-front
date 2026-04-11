"use client";

import type { ComponentType } from "react";
import { Stethoscope, Megaphone, Pill, ShoppingCart, Wrench, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignInButton, UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type MapView = "doctors" | "reports" | "farmacias" | "ofertas" | "profesionales";

interface NavbarProps {
  totalReports?: number;
  onMenuClick?: () => void;
  mapView?: MapView;
  onMapViewChange?: (view: MapView) => void;
  sidebarDisabled?: boolean;
}

type MapViewItem = Exclude<MapView, "profesionales">;

const VIEW_CONFIG: Record<MapViewItem, { label: string; Icon: ComponentType<{ className?: string }> }> = {
  doctors:   { label: "Médicos",   Icon: Stethoscope },
  reports:   { label: "Reportes",  Icon: Megaphone },
  farmacias: { label: "Farmacias", Icon: Pill },
  ofertas:   { label: "Ofertas",   Icon: ShoppingCart },
};

export default function Navbar({ onMenuClick, mapView = "reports", onMapViewChange, sidebarDisabled }: NavbarProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;

    async function fetchUnread() {
      const token = await getToken();
      if (!token || cancelled) return;
      const res = await fetch(`${API}/api/conversations/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && !cancelled) {
        const { count } = await res.json();
        setUnreadCount(count);
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000); // polling cada 30s
    return () => { cancelled = true; clearInterval(interval); };
  }, [isSignedIn]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1002] bg-gray-900 text-white shadow-lg">
      <div className="flex items-center gap-2 px-3 py-2">

        {/* Hamburguesa — solo si hay sidebar */}
        {onMenuClick && (
          <button
            onClick={sidebarDisabled ? undefined : onMenuClick}
            data-tour="sidebar-toggle"
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${sidebarDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-800"}`}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Título */}
        <h1
          className="text-sm font-bold truncate flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push("/")}
        >
          Reportes RQ
        </h1>

        {/* Pills de vista */}
        <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto" data-tour="view-pills">
          {(["doctors", "reports", "farmacias", "ofertas"] as MapViewItem[]).map((view) => {
            const { label, Icon } = VIEW_CONFIG[view];
            const handleClick = () => {
              if (view === "ofertas") return router.push("/ofertas");
              if (onMapViewChange) return onMapViewChange(view);
              router.push("/");
            };
            return (
              <button
                key={view}
                onClick={handleClick}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                  mapView === view
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
          <button
            onClick={() => router.push("/profesionales")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
              mapView === "profesionales"
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Oficios</span>
          </button>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSignedIn ? (
            <div className="relative">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link label="Mi perfil" labelIcon={<User className="w-4 h-4" />} href="/mi-perfil" />
                </UserButton.MenuItems>
              </UserButton>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none pointer-events-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-gray-900 hover:bg-gray-200 transition-colors">
                Entrar
              </button>
            </SignInButton>
          )}
        </div>

      </div>
    </nav>
  );
}
