"use client";

import type { ComponentType } from "react";
import { Home, Stethoscope, Megaphone, Pill, ShoppingCart, Wrench, Store, Briefcase, User, Bell, MessageCircle, X, Settings, Sun, Moon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton, useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

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

interface UnreadConversation {
  id: string;
  professionalName: string;
  lastMessage: string;
  lastMessageTime: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export default function Navbar({ onMenuClick, mapView = "reports", onMapViewChange, sidebarDisabled }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { openSignIn } = useClerk();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState<UnreadConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(fetchUnread, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isSignedIn]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  async function fetchUnreadConversations() {
    const token = await getToken();
    if (!token) return;
    setLoadingConversations(true);
    try {
      const res = await fetch(`${API}/api/conversations/professional`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      // El endpoint devuelve { items, hasMore, nextCursor }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] = Array.isArray(data) ? data : (data.items ?? []);

      const unread: UnreadConversation[] = items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((conv: any) => (conv._unreadCount ?? 0) > 0)
        .slice(0, 5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((conv: any) => {
          const lastMsg = Array.isArray(conv.Message) ? conv.Message[0] : null;
          const professional = conv.Professional ?? {};
          return {
            id: conv.id,
            professionalName: `${professional.nombre ?? ""} ${professional.apellido ?? ""}`.trim() || "Profesional",
            lastMessage: (lastMsg?.content ?? "").slice(0, 60),
            lastMessageTime: lastMsg?.createdAt ?? "",
          };
        });

      setUnreadConversations(unread);
    } finally {
      setLoadingConversations(false);
    }
  }

  function handleBellClick() {
    const next = !dropdownOpen;
    setDropdownOpen(next);
    if (next) {
      fetchUnreadConversations();
    }
  }

  function handleConversationClick(id: string) {
    router.push(`/chat/${id}`);
    setDropdownOpen(false);
  }

  const navBg      = isDark ? "bg-gray-900"  : "bg-white";
  const navText    = isDark ? "text-white"   : "text-gray-900";
  const hoverBg    = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const iconColor  = isDark ? "text-gray-300" : "text-gray-600";
  const pillInact  = isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200";
  const dropBg     = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const dropBorder = isDark ? "border-gray-800" : "border-gray-200";
  const dropHover  = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const textSec    = isDark ? "text-gray-400" : "text-gray-500";
  const textMut    = isDark ? "text-gray-600" : "text-gray-400";
  const shadow     = isDark ? "shadow-lg" : "shadow-sm border-b border-gray-200";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1002] ${navBg} ${navText} ${shadow}`}>
      <div className="max-w-5xl mx-auto w-full flex items-center gap-2 px-4 py-2">

        {/* Hamburguesa — solo si hay sidebar y no está deshabilitado */}
        {onMenuClick && !sidebarDisabled && (
          <button
            onClick={onMenuClick}
            data-tour="sidebar-toggle"
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${hoverBg}`}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <img
          src="/icon.svg"
          className="w-7 h-7 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          alt="Reportes RQ"
          onClick={() => router.push("/home")}
        />

        {/* Spacer mobile — empuja auth a la derecha cuando las pills están ocultas */}
        <div className="flex-1 md:hidden" />

        {/* Pills de vista — ocultas en mobile, se muestran en el bottom nav. Ocultas en desktop cuando sidebarDisabled */}
        <div className={`hidden ${sidebarDisabled ? "" : "md:flex"} flex-1 items-center justify-center gap-1 overflow-x-auto`} data-tour="view-pills">
          {(
            [
              { key: "home",      label: "Home",      Icon: Home,         href: "/home",               active: pathname === "/home",                                                            mapKey: null },
              { key: "oficios",   label: "Oficios",   Icon: Wrench,       href: "/oficios",            active: pathname.startsWith("/oficios") || pathname.startsWith("/profesional"),           mapKey: null },
              { key: "comercios", label: "Comercios", Icon: Store,        href: "/comercios",           active: pathname.startsWith("/comercios") || pathname.startsWith("/comercio"),           mapKey: null },
              { key: "ofertas",   label: "Ofertas",   Icon: ShoppingCart, href: "/ofertas",             active: pathname.startsWith("/ofertas"),                                                 mapKey: null },
              { key: "empleos",   label: "Empleos",   Icon: Briefcase,    href: "/empleos",             active: pathname.startsWith("/empleos") || pathname.startsWith("/empleo") || pathname.startsWith("/vacante"), mapKey: null },
              { key: "medicos",   label: "Médicos",   Icon: Stethoscope,  href: "/medicos",             active: pathname.startsWith("/medicos") || (pathname === "/app" && mapView === "doctors"), mapKey: null },
              { key: "farmacias", label: "Farmacias", Icon: Pill,         href: "/app?view=farmacias",  active: pathname === "/app" && mapView === "farmacias",                                   mapKey: "farmacias" as MapViewItem | null },
              { key: "reportes",  label: "Reportes",  Icon: Megaphone,    href: "/app",                 active: pathname === "/app" && mapView === "reports",                                    mapKey: "reports" as MapViewItem | null },
            ] as { key: string; label: string; Icon: ComponentType<{ className?: string }>; href: string; active: boolean; mapKey: MapViewItem | null }[]
          ).map(({ key, label, Icon, href, active, mapKey }) => (
            <button
              key={key}
              onClick={() => {
                if (mapKey && onMapViewChange && pathname === "/app") onMapViewChange(mapKey);
                else router.push(href);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                active ? "bg-green-500 text-white" : pillInact
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {isSignedIn ? (
            <>
              {/* Campana de notificaciones */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleBellClick}
                  className={`relative p-1.5 rounded-lg ${hoverBg} transition-colors`}
                  aria-label="Notificaciones"
                >
                  <Bell className={`w-5 h-5 ${iconColor}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className={`fixed top-14 left-2 right-2 md:absolute md:top-10 md:left-auto md:right-0 md:w-80 border rounded-2xl shadow-xl z-50 ${dropBg}`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${dropBorder}`}>
                      <span className={`text-sm font-semibold ${navText}`}>Mensajes</span>
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className={`${textSec} transition-colors`}
                        aria-label="Cerrar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    {loadingConversations ? (
                      <div className={`px-4 py-6 text-center text-xs ${textMut}`}>Cargando...</div>
                    ) : unreadConversations.length === 0 ? (
                      <div className={`px-4 py-6 text-center text-xs ${textMut}`}>Sin mensajes nuevos</div>
                    ) : (
                      <ul>
                        {unreadConversations.map((conv) => (
                          <li
                            key={conv.id}
                            onClick={() => handleConversationClick(conv.id)}
                            className={`${dropHover} cursor-pointer px-4 py-3 flex flex-col gap-0.5 first:rounded-t-none last:rounded-b-2xl transition-colors`}
                          >
                            <span className={`text-sm font-semibold ${navText}`}>{conv.professionalName}</span>
                            <span className={`text-xs ${textSec} truncate`}>{conv.lastMessage}</span>
                            {conv.lastMessageTime && (
                              <span className={`text-xs ${textMut}`}>{formatTime(conv.lastMessageTime)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Mis chats */}
              <button
                onClick={() => router.push("/chats")}
                className={`p-1.5 rounded-lg ${hoverBg} transition-colors`}
                aria-label="Mis chats"
              >
                <MessageCircle className={`w-5 h-5 ${iconColor}`} />
              </button>

              {/* UserButton sin badge */}
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link label="Mi perfil" labelIcon={<User className="w-4 h-4" />} href="/mi-perfil" />
                  <UserButton.Link label="Configuración" labelIcon={<Settings className="w-4 h-4" />} href="/settings" />
                </UserButton.MenuItems>
              </UserButton>
            </>
          ) : (
              <button
                onClick={() => openSignIn()}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${isDark ? "bg-white text-gray-900 hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-gray-700"}`}
              >
                Entrar
              </button>
          )}

          {/* Toggle de tema — siempre visible */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className={`p-2 rounded-full ${textSec} ${hoverBg} transition-colors`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </nav>
  );
}
