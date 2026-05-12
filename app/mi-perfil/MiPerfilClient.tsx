"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { MapPin, Phone, MessageCircle, Bell, Store } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

const ADMIN_CLERK_IDS = (process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

interface Conversation {
  id: string;
  status: "open" | "agreed" | "completed";
  createdAt: string;
  updatedAt: string;
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string };
  Message: { content: string; senderType: string; createdAt: string }[];
}

interface Favorite {
  id: string;
  professionalId: string;
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string; ratingAvg: number; ratingCount: number };
}

interface ProfessionalProfile {
  id: string;
  nombre: string;
  apellido: string;
  descripcion?: string;
  telefono?: string;
  whatsapp?: string;
  barrio?: string;
  disponible: boolean;
  foto?: string;
  oficios: string[];
  slug: string;
}

interface ComercioProfile {
  id: string;
  nombre: string;
  rubro: string;
  slug: string;
  barrio: string;
  direccion?: string;
  horario?: string;
  foto?: string;
  activo: boolean;
}

const STATUS_MAP: Record<string, { label: string; dot: string }> = {
  open:      { label: "Activo",     dot: "bg-blue-400" },
  agreed:    { label: "Acordado",   dot: "bg-green-400" },
  completed: { label: "Finalizado", dot: "bg-gray-500" },
};

function fotoUrl(foto?: string) {
  if (!foto) return undefined;
  return foto.startsWith("/uploads/") ? `${foto}` : foto;
}

function ProAvatar({ foto, nombre, size = "md" }: { foto?: string; nombre: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";
  const px = size === "sm" ? 36 : 44;
  return (
    <div className={`${cls} rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center font-bold text-gray-300`}>
      {foto ? (
        <Image src={fotoUrl(foto) ?? ""} alt={nombre} width={px} height={px} className="w-full h-full object-cover" unoptimized />
      ) : nombre[0].toUpperCase()}
    </div>
  );
}

function EmptyState({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-gray-600">{text}</p>
      <Link href={href} className="mt-2 inline-block text-sm text-gray-400 hover:text-white underline transition-colors">
        {cta} →
      </Link>
    </div>
  );
}

function NotificationBanner() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem("notif-banner-dismissed") === "1");
  }, []);

  async function handleActivar() {
    const granted = await requestPermission();
    if (granted) setDismissed(true);
  }

  function handleDismiss() {
    localStorage.setItem("notif-banner-dismissed", "1");
    setDismissed(true);
  }

  if (!mounted || !isSupported || permission === "granted" || dismissed) return null;

  return (
    <div className="bg-blue-950/50 border border-blue-800 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3">
      <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-blue-100">
          Activa las notificaciones para saber cuando un cliente te contacta
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleActivar}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Activar notificaciones
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-blue-300 hover:text-blue-100 text-xs font-medium transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfessionalProfileSection({
  profile,
  onUpdate,
}: {
  profile: ProfessionalProfile;
  onUpdate: (updated: ProfessionalProfile) => void;
}) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [descripcion, setDescripcion] = useState(profile.descripcion ?? "");
  const [telefono, setTelefono] = useState(profile.telefono ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [barrio, setBarrio] = useState(profile.barrio ?? "");
  const [disponible, setDisponible] = useState(profile.disponible);

  function openEdit() {
    setDescripcion(profile.descripcion ?? "");
    setTelefono(profile.telefono ?? "");
    setWhatsapp(profile.whatsapp ?? "");
    setBarrio(profile.barrio ?? "");
    setDisponible(profile.disponible);
    setSaveError(null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/professionals/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ descripcion, telefono, whatsapp, barrio, disponible }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const updated: ProfessionalProfile = await res.json();
      onUpdate(updated);
      setEditing(false);
    } catch {
      setSaveError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const token = await getToken();
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`/api/professionals/me/photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error("Error al subir foto");
      const data = await res.json();
      onUpdate({ ...profile, foto: data.foto });
    } catch {
      // silencioso
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
          </svg>
          <span className="font-semibold text-sm text-white">Mi perfil profesional</span>
        </div>
        {!editing && (
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar perfil
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 px-5 py-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center font-bold text-gray-300 text-xl ring-2 ring-gray-700">
            {profile.foto
              ? <Image src={fotoUrl(profile.foto) ?? ""} alt={profile.nombre} width={64} height={64} className="w-full h-full object-cover" unoptimized />
              : profile.nombre[0].toUpperCase()}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Cambiar foto"
          >
            {uploadingPhoto ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{profile.nombre} {profile.apellido}</p>
          <p className="text-xs text-gray-400 capitalize mt-0.5">{profile.oficios.join(", ")}</p>
          <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${profile.disponible ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${profile.disponible ? "bg-green-400" : "bg-gray-600"}`} />
            {profile.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>

        <Link
          href={`/profesional/${profile.slug}`}
          className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-300 transition-colors underline"
        >
          Ver perfil público
        </Link>
      </div>

      {!editing && (
        <div className="px-5 pb-5 flex flex-col gap-2">
          {profile.descripcion && (
            <p className="text-sm text-gray-400">{profile.descripcion}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {profile.barrio && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.barrio}</span>}
            {profile.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.telefono}</span>}
            {profile.whatsapp && <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />WhatsApp: {profile.whatsapp}</span>}
          </div>
        </div>
      )}

      {editing && (
        <div className="px-5 pb-5 flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Contá brevemente tu experiencia y servicios..."
              className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-600 transition-colors"
              style={{ color: "#f9fafb" }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Barrio / Zona</label>
            <input
              type="text"
              value={barrio}
              onChange={e => setBarrio(e.target.value)}
              placeholder="Ej: Palermo, Villa Crespo..."
              className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
              style={{ color: "#f9fafb" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+54 11..."
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
                style={{ color: "#f9fafb" }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+54 11..."
                className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 transition-colors"
                style={{ color: "#f9fafb" }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-800 border border-gray-700">
            <div>
              <p className="text-sm text-white font-medium">Disponible</p>
              <p className="text-xs text-gray-500">Mostrá que estás recibiendo consultas</p>
            </div>
            <button
              onClick={() => setDisponible(d => !d)}
              className={`relative w-11 h-6 rounded-full transition-colors ${disponible ? "bg-indigo-600" : "bg-gray-700"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${disponible ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          {saveError && <p className="text-xs text-red-400">{saveError}</p>}
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ComercioProfileSection({ profile }: { profile: ComercioProfile }) {
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-sm text-white">Mi comercio</span>
        </div>
        <Link
          href={`/comercio/${profile.slug}`}
          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
        >
          Ver perfil publico
        </Link>
      </div>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700 bg-gray-800 flex items-center justify-center font-bold text-gray-300 text-xl">
          {profile.foto
            ? <Image src={profile.foto} alt={profile.nombre} width={56} height={56} className="w-full h-full object-cover" unoptimized />
            : profile.nombre[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{profile.nombre}</p>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full border mt-0.5 bg-amber-900/40 text-amber-400 border-amber-800">
            {profile.rubro}
          </span>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />{profile.barrio}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MiPerfilClient() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken, userId } = useAuth();

  const [tab, setTab] = useState<"chats" | "favoritos">("chats");
  const [allConvs, setAllConvs] = useState<Conversation[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [hasProfessionalProfile, setHasProfessionalProfile] = useState<boolean | null>(null);
  const [comercioProfile, setComercioProfile] = useState<ComercioProfile | null>(null);
  const [hasComercioProfile, setHasComercioProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    loadData();
  }, [isLoaded, user]);

  async function loadData() {
    setLoading(true);
    try {
      const token = await getToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [proConvsRes, favRes, meRes, meComercioRes] = await Promise.all([
        fetch(`/api/conversations/professional`, { headers: authHeaders }),
        fetch(`/api/favorites`, { headers: authHeaders }),
        fetch(`/api/professionals/me`, { headers: authHeaders }),
        fetch(`/api/comercios/me`, { headers: authHeaders }),
      ]);

      const proConvs: Conversation[] = proConvsRes.ok ? await proConvsRes.json() : [];
      const favs: Favorite[] = favRes.ok ? await favRes.json() : [];

      if (meRes.ok) {
        const proData: ProfessionalProfile = await meRes.json();
        setProfessionalProfile(proData);
        setHasProfessionalProfile(true);
      } else {
        setProfessionalProfile(null);
        setHasProfessionalProfile(false);
      }

      if (meComercioRes.ok) {
        const comData: ComercioProfile = await meComercioRes.json();
        setComercioProfile(comData);
        setHasComercioProfile(true);
      } else {
        setComercioProfile(null);
        setHasComercioProfile(false);
      }

      let clientConvs: Conversation[] = [];
      if (userId) {
        const cRes = await fetch(`/api/conversations/client/${userId}`);
        if (cRes.ok) clientConvs = await cRes.json();
      }

      const seen = new Set<string>();
      const merged = [...proConvs, ...clientConvs]
        .filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setAllConvs(merged);
      setFavorites(favs);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const activeConvs = allConvs.filter((c) => c.status !== "completed");
  const closedConvs = allConvs.filter((c) => c.status === "completed");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar mapView="profesionales" />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-40">

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-900 border border-gray-800 mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700">
            {user.imageUrl
              ? <Image src={user.imageUrl} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" unoptimized />
              : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-300">{user.firstName?.[0] ?? "U"}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg leading-tight">{user.fullName || user.firstName || "Usuario"}</p>
            <p className="text-sm text-gray-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Miembro desde {new Date(user.createdAt!).toLocaleDateString("es-AR", { year: "numeric", month: "long" })}
            </p>
            {ADMIN_CLERK_IDS.includes(user.id) && (
              <Link href="/admin" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block">
                Panel de administración →
              </Link>
            )}
          </div>
        </div>

        {hasProfessionalProfile === true && professionalProfile && (
          <>
            <ProfessionalProfileSection
              profile={professionalProfile}
              onUpdate={setProfessionalProfile}
            />
            <NotificationBanner />
          </>
        )}

        {hasComercioProfile === true && comercioProfile && (
          <ComercioProfileSection profile={comercioProfile} />
        )}

        {hasProfessionalProfile === false && hasComercioProfile === false && (
          <Link href="/profesional/nuevo">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-900/30 border border-indigo-700/50 hover:border-indigo-600 transition-colors cursor-pointer mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-800/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">¿Sos profesional de oficio?</p>
                <p className="text-xs text-indigo-300/80 mt-0.5">Creá tu perfil gratis y empezá a recibir consultas</p>
              </div>
              <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        <div className="flex gap-2 mb-6">
          {(["chats", "favoritos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${
                tab === t
                  ? "bg-white text-gray-950"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {t === "chats" ? "Mis chats" : "Favoritos"}
              {t === "chats" && allConvs.length > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${tab === "chats" ? "bg-gray-200 text-gray-900" : "bg-gray-700 text-gray-300"}`}>
                  {allConvs.length}
                </span>
              )}
              {t === "favoritos" && favorites.length > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${tab === "favoritos" ? "bg-gray-200 text-gray-900" : "bg-gray-700 text-gray-300"}`}>
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />)}
          </div>
        ) : tab === "chats" ? (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Activos {activeConvs.length > 0 && `(${activeConvs.length})`}
              </p>
              {activeConvs.length === 0 ? (
                <EmptyState text="No tenés chats activos." cta="Buscar profesionales" href="/profesionales" />
              ) : (
                <div className="flex flex-col gap-2">
                  {activeConvs.map((conv) => <ConvCard key={conv.id} conv={conv} />)}
                </div>
              )}
            </div>
            {closedConvs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Finalizados ({closedConvs.length})
                </p>
                <div className="flex flex-col gap-2">
                  {closedConvs.map((conv) => <ConvCard key={conv.id} conv={conv} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Guardados {favorites.length > 0 && `(${favorites.length})`}
            </p>
            {favorites.length === 0 ? (
              <EmptyState text="No guardaste favoritos aún." cta="Explorar profesionales" href="/profesionales" />
            ) : (
              <div className="flex flex-col gap-2">
                {favorites.map((fav) => {
                  const pro = fav.Professional;
                  return (
                    <Link key={fav.id} href={`/profesional/${pro.slug}`}>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
                        <ProAvatar foto={pro.foto} nombre={pro.nombre} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white">{pro.nombre} {pro.apellido}</p>
                          <p className="text-xs text-gray-400 capitalize">{pro.oficios[0]}</p>
                          {pro.ratingCount > 0 && (
                            <p className="text-xs text-yellow-400 mt-0.5">★ {pro.ratingAvg.toFixed(1)} · {pro.ratingCount} opinión{pro.ratingCount !== 1 ? "es" : ""}</p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConvCard({ conv }: { conv: Conversation }) {
  const pro = conv.Professional;
  const lastMsg = conv.Message?.[conv.Message.length - 1];
  const { label, dot } = STATUS_MAP[conv.status] ?? STATUS_MAP.open;

  return (
    <Link href={`/chat/${conv.id}`}>
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all cursor-pointer">
        <ProAvatar foto={pro?.foto} nombre={pro?.nombre ?? "?"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-white truncate">{pro?.nombre} {pro?.apellido}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 capitalize truncate">{pro?.oficios?.[0]}</p>
          {lastMsg && (
            <p className="text-xs text-gray-600 truncate mt-0.5">
              {lastMsg.senderType === "client" ? "Vos: " : ""}{lastMsg.content}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs text-gray-600">
            {new Date(conv.updatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
    </Link>
  );
}
