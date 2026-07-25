"use client";

import { Search, X, User, Settings, Sun, Moon, LayoutDashboard, CalendarDays } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchDropdown } from "./SearchDropdown";
import { UserButton, useUser, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

import { API_URL } from "../lib/api/client";

type MapView = "doctors" | "reports" | "farmacias" | "ofertas" | "profesionales";

interface NavbarProps {
  totalReports?: number;
  onMenuClick?: () => void;
  mapView?: MapView;
  onMapViewChange?: (view: MapView) => void;
  sidebarDisabled?: boolean;
}

const CATEGORY_LINKS = [
  { label: "Home",      href: "/home" },
  { label: "Oficios",   href: "/oficios" },
  { label: "Comercios", href: "/comercios" },
  { label: "Médicos",   href: "/medicos" },
  { label: "Patio Limpio", href: "/patio-limpio" },
  { label: "Farmacias", href: "/app?view=farmacias" },
  { label: "Reportes",  href: "/app" },
] as const;

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
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { openSignIn } = useClerk();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState<UnreadConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [hasProfessionalProfile, setHasProfessionalProfile] = useState(false);
  const [hasPanelCode, setHasPanelCode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasPanelCode(!!localStorage.getItem("professional_panel_code"));
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;

    async function fetchUnread() {
      const token = await getToken();
      if (!token || cancelled) return;
      const res = await fetch(`${API_URL}/api/conversations/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && !cancelled) {
        const { count } = await res.json();
        setUnreadCount(count);
      }
    }

    async function checkProfessionalProfile() {
      const token = await getToken();
      if (!token || cancelled) return;
      const res = await fetch(`${API_URL}/api/professionals/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && !cancelled) setHasProfessionalProfile(true);
    }

    fetchUnread();
    checkProfessionalProfile();
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setMobileSearchOpen(false);
      }
    }
    if (mobileSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileSearchOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileSearchOpen(false);
    }
    if (mobileSearchOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  async function fetchUnreadConversations() {
    const token = await getToken();
    if (!token) return;
    setLoadingConversations(true);
    try {
      const res = await fetch(`${API_URL}/api/conversations/professional`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
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
    if (next) fetchUnreadConversations();
  }

  function handleConversationClick(id: string) {
    router.push(`/chat/${id}`);
    setDropdownOpen(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setMobileSearchOpen(false);
    setShowDropdown(false);
    if (q) {
      router.push(`/buscar?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/buscar");
    }
  }

  function isActive(href: string): boolean {
    if (href === "/home") return pathname === "/home";
    if (href === "/oficios") return pathname.startsWith("/oficios") || pathname.startsWith("/profesional");
    if (href === "/comercios") return pathname.startsWith("/comercios") || pathname.startsWith("/comercio");
    if (href === "/medicos") return pathname.startsWith("/medicos");
    if (href === "/patio-limpio") return pathname.startsWith("/patio-limpio");
    if (href === "/app?view=farmacias") return pathname === "/app" && searchParams.get("view") === "farmacias";
    if (href === "/app") return pathname === "/app" && (!searchParams.get("view") || searchParams.get("view") === "reports");
    return false;
  }

  const navBg    = isDark ? "bg-gray-900" : "bg-white";
  const navText  = isDark ? "text-white" : "text-gray-900";
  const hoverBg  = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const dropBg   = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const dropHover = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const textSec  = isDark ? "text-gray-400" : "text-gray-500";
  const textMut  = isDark ? "text-gray-600" : "text-gray-400";
  const shadow   = isDark ? "shadow-lg" : "shadow-sm border-b border-gray-200";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1002] ${navBg} ${navText} ${shadow}`}>
      <div className="w-full">

        {/* ROW 1 */}
        <div className="flex items-center gap-2 px-4 py-2 max-w-5xl mx-auto w-full">

          <img
            src="/icon.svg"
            className="w-7 h-7 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            alt="Reportes RQ"
            onClick={() => router.push("/home")}
          />

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 items-center max-w-2xl mx-auto">
            <div className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                placeholder="Buscar plomero, electricista, médico..."
                className={`w-full rounded-full pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
                } border`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSec} hover:opacity-70 transition-opacity`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <SearchDropdown
              query={query}
              isDark={isDark}
              visible={showDropdown && query.length >= 2}
              onClose={() => setShowDropdown(false)}
              onClear={() => { setQuery(""); setShowDropdown(false); }}
            />
            </div>
          </div>

          {/* Mobile spacer + search icon */}
          <div className="flex-1 md:hidden" />
          <div className="md:hidden">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className={`p-2 rounded-lg transition-colors ${hoverBg}`}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Auth + Theme */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSignedIn ? (
              <UserButton>
                <UserButton.MenuItems>
                  {hasProfessionalProfile && (
                    <UserButton.Link
                      label="Mi panel profesional"
                      labelIcon={<LayoutDashboard className="w-4 h-4" />}
                      href="/profesional/gestionar"
                    />
                  )}
                  <UserButton.Link
                    label="Mis eventos"
                    labelIcon={<CalendarDays className="w-4 h-4" />}
                    href="/mis-eventos"
                  />
                  <UserButton.Link label="Mi perfil" labelIcon={<User className="w-4 h-4" />} href="/mi-perfil" />
                  <UserButton.Link label="Configuración" labelIcon={<Settings className="w-4 h-4" />} href="/settings" />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <>
                {hasPanelCode && (
                  <button
                    onClick={() => router.push("/profesional/gestionar")}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Mi panel
                  </button>
                )}
                <button
                  onClick={() => openSignIn()}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${isDark ? "bg-white text-gray-900 hover:bg-gray-200" : "bg-gray-900 text-white hover:bg-gray-700"}`}
                >
                  Entrar
                </button>
              </>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className={`p-2 rounded-full ${textSec} ${hoverBg} transition-colors`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile search overlay */}
        <div
          ref={mobileSearchRef}
          className={`md:hidden transition-all duration-300 ease-in-out ${
            mobileSearchOpen ? "max-h-[90vh] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 pb-3">
            <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                placeholder="Buscar plomero, electricista, médico..."
                className={`w-full rounded-full pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
                } border`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSec} hover:opacity-70 transition-opacity`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <SearchDropdown
              query={query}
              isDark={isDark}
              visible={showDropdown && query.length >= 2 && mobileSearchOpen}
              onClose={() => setShowDropdown(false)}
              onClear={() => { setQuery(""); setShowDropdown(false); }}
            />
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className={`border-t ${navBg} ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className="max-w-5xl mx-auto w-full px-4">
            <div className="flex items-center gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden py-2 text-sm">
              {CATEGORY_LINKS.map((link, i) => {
                const active = isActive(link.href);
                return (
                  <span key={link.label} className="flex items-center gap-0 whitespace-nowrap">
                    {i > 0 && (
                      <span className={`mx-1 select-none ${isDark ? "text-gray-600" : "text-gray-300"}`}>·</span>
                    )}
                    <button
                      onClick={() => router.push(link.href)}
                      className={`px-2 py-1 transition-colors whitespace-nowrap flex-shrink-0 ${
                        active
                          ? "text-green-500 font-semibold border-b-2 border-green-500"
                          : `${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
                      }`}
                    >
                      {link.label}
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}
