"use client";

import type { ComponentType } from "react";
import { Stethoscope, Megaphone, Pill, ShoppingCart, Wrench, User, Bell, X, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignInButton, UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

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
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unread: UnreadConversation[] = (data as any[])
        .filter((conv) =>
          Array.isArray(conv.Message) &&
          conv.Message.some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (msg: any) => msg.read === false && msg.senderType === "client"
          )
        )
        .slice(0, 5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((conv: any) => {
          const unreadMessages = conv.Message.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (msg: any) => msg.read === false && msg.senderType === "client"
          );
          const lastMsg = unreadMessages[unreadMessages.length - 1];
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

        {/* Logo */}
        <img
          src="/icon.svg"
          className="w-7 h-7 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          alt="Reportes RQ"
          onClick={() => router.push("/app")}
        />

        {/* Spacer mobile — empuja auth a la derecha cuando las pills están ocultas */}
        <div className="flex-1 md:hidden" />

        {/* Pills de vista — ocultas en mobile, se muestran en el bottom nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto" data-tour="view-pills">
          {(["doctors", "reports", "farmacias", "ofertas"] as MapViewItem[]).map((view) => {
            const { label, Icon } = VIEW_CONFIG[view];
            const handleClick = () => {
              if (view === "ofertas") return router.push("/ofertas");
              if (onMapViewChange) return onMapViewChange(view);
              router.push(`/app?view=${view}`);
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
            <>
              {/* Campana de notificaciones */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleBellClick}
                  className="relative p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                      <span className="text-sm font-semibold text-white">Mensajes</span>
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Cerrar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    {loadingConversations ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">Cargando...</div>
                    ) : unreadConversations.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">Sin mensajes nuevos</div>
                    ) : (
                      <ul>
                        {unreadConversations.map((conv) => (
                          <li
                            key={conv.id}
                            onClick={() => handleConversationClick(conv.id)}
                            className="hover:bg-gray-800 cursor-pointer px-4 py-3 flex flex-col gap-0.5 first:rounded-t-none last:rounded-b-2xl transition-colors"
                          >
                            <span className="text-sm font-semibold text-white">{conv.professionalName}</span>
                            <span className="text-xs text-gray-400 truncate">{conv.lastMessage}</span>
                            {conv.lastMessageTime && (
                              <span className="text-xs text-gray-600">{formatTime(conv.lastMessageTime)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* UserButton sin badge */}
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link label="Mi perfil" labelIcon={<User className="w-4 h-4" />} href="/mi-perfil" />
                  <UserButton.Link label="Configuración" labelIcon={<Settings className="w-4 h-4" />} href="/settings" />
                </UserButton.MenuItems>
              </UserButton>
            </>
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
