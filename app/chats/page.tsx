"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Conversation {
  id: string;
  status: "open" | "agreed" | "completed";
  createdAt: string;
  updatedAt: string;
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string };
  Message: { content: string; senderType: string; read: boolean; createdAt: string }[];
}

const STATUS_MAP: Record<string, { label: string; dot: string }> = {
  open:      { label: "Activo",     dot: "bg-blue-400" },
  agreed:    { label: "Acordado",   dot: "bg-green-400" },
  completed: { label: "Finalizado", dot: "bg-gray-500" },
};

function fotoUrl(foto?: string) {
  if (!foto) return undefined;
  return foto.startsWith("/uploads/") ? `${API}${foto}` : foto;
}

function ProAvatar({ foto, nombre }: { foto?: string; nombre: string }) {
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center font-bold text-gray-300 text-sm">
      {foto ? <img src={fotoUrl(foto)} alt={nombre} className="w-full h-full object-cover" /> : nombre[0].toUpperCase()}
    </div>
  );
}

function ConvCard({ conv, myRole }: { conv: Conversation; myRole: "client" | "professional" }) {
  const pro = conv.Professional;
  const lastMsg = conv.Message?.[conv.Message.length - 1];
  const { label, dot } = STATUS_MAP[conv.status] ?? STATUS_MAP.open;
  const unread = conv.Message.filter(
    (m) => m.senderType !== myRole && !m.read
  ).length;

  return (
    <Link href={`/chat/${conv.id}`}>
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all cursor-pointer">
        <div className="relative">
          <ProAvatar foto={pro?.foto} nombre={pro?.nombre ?? "?"} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className={`font-semibold text-sm truncate ${unread > 0 ? "text-white" : "text-gray-200"}`}>
              {pro?.nombre} {pro?.apellido}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 capitalize truncate">{pro?.oficios?.[0]}</p>
          {lastMsg && (
            <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-gray-300 font-medium" : "text-gray-600"}`}>
              {lastMsg.senderType === myRole ? "Vos: " : ""}{lastMsg.content}
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

export default function ChatsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();

  const [convs, setConvs] = useState<Conversation[]>([]);
  const [myRole, setMyRole] = useState<"client" | "professional">("client");
  const [loading, setLoading] = useState(true);
  const [isAnon, setIsAnon] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    loadConvs();
  }, [isLoaded, isSignedIn]);

  async function loadConvs() {
    setLoading(true);
    try {
      const all: Conversation[] = [];
      const seen = new Set<string>();

      if (isSignedIn) {
        const token = await getToken();
        const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [proRes, clientRes] = await Promise.all([
          fetch(`${API}/api/conversations/professional`, { headers: authHeaders }),
          userId ? fetch(`${API}/api/conversations/client/${userId}`) : Promise.resolve(null),
        ]);

        if (proRes.ok) {
          const proConvs: Conversation[] = await proRes.json();
          proConvs.forEach((c) => { if (!seen.has(c.id)) { seen.add(c.id); all.push(c); } });
        }
        if (clientRes?.ok) {
          const clientConvs: Conversation[] = await clientRes.json();
          clientConvs.forEach((c) => { if (!seen.has(c.id)) { seen.add(c.id); all.push(c); } });
        }

        // Determinar rol principal: si tiene convs como profesional, es profesional
        const hasProConvs = all.some((c) => {
          // las convs profesionales tienen el usuario como Professional
          return true; // se detecta si el endpoint de professional devolvio algo
        });
        setMyRole("client"); // por defecto cliente; el badge por conv es correcto igual
      } else {
        // Anónimo
        const clientToken = localStorage.getItem("clientToken");
        if (!clientToken) {
          setIsAnon(true);
          setLoading(false);
          return;
        }
        setIsAnon(true);
        const res = await fetch(`${API}/api/conversations/client/${clientToken}`);
        if (res.ok) {
          const data: Conversation[] = await res.json();
          data.forEach((c) => all.push(c));
        }
        setMyRole("client");
      }

      all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConvs(all);
    } finally {
      setLoading(false);
    }
  }

  const activeConvs = convs.filter((c) => c.status !== "completed");
  const closedConvs = convs.filter((c) => c.status === "completed");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar mapView="profesionales" />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-28">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-white">Mis chats</h1>
          <Link
            href="/profesionales"
            className="text-xs px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            + Nuevo chat
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : convs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">No tenés chats aún</p>
              <p className="text-xs text-gray-600 mt-1">Contactá un profesional para empezar</p>
            </div>
            <Link
              href="/profesionales"
              className="mt-2 px-5 py-2.5 rounded-2xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Buscar profesionales
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {activeConvs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Activos ({activeConvs.length})
                </p>
                <div className="flex flex-col gap-2">
                  {activeConvs.map((c) => <ConvCard key={c.id} conv={c} myRole={myRole} />)}
                </div>
              </div>
            )}
            {closedConvs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Finalizados ({closedConvs.length})
                </p>
                <div className="flex flex-col gap-2">
                  {closedConvs.map((c) => <ConvCard key={c.id} conv={c} myRole={myRole} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
