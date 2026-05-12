"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";

const LIMIT = 20;

interface Conversation {
  id: string;
  status: "open" | "agreed" | "completed";
  createdAt: string;
  updatedAt: string;
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string };
  Message?: { content: string; senderType: string; read: boolean; createdAt: string }[];
  _unreadCount?: number;
}

interface PagedResponse {
  items: Conversation[];
  hasMore: boolean;
  nextCursor: string | null;
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

function ProAvatar({ foto, nombre }: { foto?: string; nombre: string }) {
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center font-bold text-gray-300 text-sm">
      {foto
        ? <Image src={fotoUrl(foto) ?? ""} alt={nombre} width={44} height={44} className="w-full h-full object-cover" unoptimized />
        : nombre[0].toUpperCase()}
    </div>
  );
}

function ConvCard({
  conv,
  myRole,
  onDelete,
}: {
  conv: Conversation;
  myRole: "client" | "professional";
  onDelete: (id: string) => void;
}) {
  const { getToken, isSignedIn } = useAuth();
  const pro = conv.Professional;
  const lastMsg = conv.Message?.[conv.Message.length - 1];
  const { label, dot } = STATUS_MAP[conv.status] ?? STATUS_MAP.open;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const unread =
    conv._unreadCount !== undefined
      ? conv._unreadCount
      : (conv.Message ?? []).filter((m) => m.senderType !== myRole && !m.read).length;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      const clientToken = typeof window !== "undefined" ? localStorage.getItem("clientToken") : null;
      const params = clientToken ? `?clientToken=${clientToken}` : "";
      const headers: Record<string, string> = {};
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/conversations/${conv.id}${params}`, { method: "DELETE", headers });
      if (res.ok) onDelete(conv.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-800/60">
        <p className="flex-1 text-sm text-red-300">Eliminar este chat?</p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Eliminar"}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); setConfirming(false); }}
          className="px-3 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Link href={`/chat/${conv.id}`}>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-all cursor-pointer pr-12">
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
          <span className="text-xs text-gray-600 flex-shrink-0">
            {new Date(conv.updatedAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
          </span>
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-950/40 transition-colors"
        aria-label="Eliminar chat"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function parsePagedResponse(data: unknown): PagedResponse {
  if (Array.isArray(data)) {
    return { items: data as Conversation[], hasMore: false, nextCursor: null };
  }
  const d = data as PagedResponse;
  return { items: d.items ?? [], hasMore: d.hasMore ?? false, nextCursor: d.nextCursor ?? null };
}

function mergeConvs(existing: Conversation[], incoming: Conversation[]): Conversation[] {
  const seen = new Set(existing.map((c) => c.id));
  const merged = [...existing];
  for (const c of incoming) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      merged.push(c);
    }
  }
  return merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export default function ChatsClient() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();

  const [convs, setConvs]               = useState<Conversation[]>([]);
  const [myRole, setMyRole]             = useState<"client" | "professional">("client");
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [isAnon, setIsAnon]             = useState(false);

  const proCursorRef    = useRef<string | null>(null);
  const clientCursorRef = useRef<string | null>(null);
  const proHasMoreRef   = useRef(false);
  const clientHasMoreRef = useRef(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);
    proCursorRef.current    = null;
    clientCursorRef.current = null;
    proHasMoreRef.current   = false;
    clientHasMoreRef.current = false;

    try {
      let merged: Conversation[] = [];

      if (isSignedIn) {
        const token = await getToken();
        const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [proRes, clientRes] = await Promise.all([
          fetch(`/api/conversations/professional?limit=${LIMIT}`, { headers: authHeaders }),
          userId ? fetch(`/api/conversations/client/${userId}?limit=${LIMIT}`) : Promise.resolve(null),
        ]);

        if (proRes.ok) {
          const paged = parsePagedResponse(await proRes.json());
          proHasMoreRef.current  = paged.hasMore;
          proCursorRef.current   = paged.nextCursor;
          merged = mergeConvs(merged, paged.items);
        }
        if (clientRes?.ok) {
          const paged = parsePagedResponse(await clientRes.json());
          clientHasMoreRef.current  = paged.hasMore;
          clientCursorRef.current   = paged.nextCursor;
          merged = mergeConvs(merged, paged.items);
        }

        setMyRole("client");
      } else {
        const clientToken = typeof window !== "undefined" ? localStorage.getItem("clientToken") : null;
        setIsAnon(true);

        if (clientToken) {
          const res = await fetch(`/api/conversations/client/${clientToken}?limit=${LIMIT}`);
          if (res.ok) {
            const paged = parsePagedResponse(await res.json());
            clientHasMoreRef.current  = paged.hasMore;
            clientCursorRef.current   = paged.nextCursor;
            merged = mergeConvs(merged, paged.items);
          }
        }
        setMyRole("client");
      }

      setConvs(merged);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, userId, getToken]);

  const loadMore = useCallback(async () => {
    if (loadingMore || (!proHasMoreRef.current && !clientHasMoreRef.current)) return;

    setLoadingMore(true);
    try {
      let incoming: Conversation[] = [];

      if (isSignedIn) {
        const token = await getToken();
        const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const fetches: Promise<void>[] = [];

        if (proHasMoreRef.current && proCursorRef.current) {
          fetches.push(
            fetch(`/api/conversations/professional?limit=${LIMIT}&cursor=${proCursorRef.current}`, { headers: authHeaders })
              .then((r) => r.ok ? r.json() : null)
              .then((data) => {
                if (!data) return;
                const paged = parsePagedResponse(data);
                proHasMoreRef.current = paged.hasMore;
                proCursorRef.current  = paged.nextCursor;
                incoming = [...incoming, ...paged.items];
              })
          );
        }

        if (clientHasMoreRef.current && clientCursorRef.current && userId) {
          fetches.push(
            fetch(`/api/conversations/client/${userId}?limit=${LIMIT}&cursor=${clientCursorRef.current}`)
              .then((r) => r.ok ? r.json() : null)
              .then((data) => {
                if (!data) return;
                const paged = parsePagedResponse(data);
                clientHasMoreRef.current = paged.hasMore;
                clientCursorRef.current  = paged.nextCursor;
                incoming = [...incoming, ...paged.items];
              })
          );
        }

        await Promise.all(fetches);
      } else {
        const clientToken = typeof window !== "undefined" ? localStorage.getItem("clientToken") : null;
        if (clientToken && clientHasMoreRef.current && clientCursorRef.current) {
          const res = await fetch(`/api/conversations/client/${clientToken}?limit=${LIMIT}&cursor=${clientCursorRef.current}`);
          if (res.ok) {
            const paged = parsePagedResponse(await res.json());
            clientHasMoreRef.current = paged.hasMore;
            clientCursorRef.current  = paged.nextCursor;
            incoming = paged.items;
          }
        }
      }

      if (incoming.length > 0) {
        setConvs((prev) => mergeConvs(prev, incoming));
      }
    } finally {
      setLoadingMore(false);
    }
  }, [isSignedIn, userId, getToken, loadingMore]);

  useEffect(() => {
    if (!isLoaded) return;
    loadConvs();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    const onVisible = () => {
      if (!document.hidden) loadConvs();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoaded, loadConvs]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const activeConvs = convs.filter((c) => c.status !== "completed");
  const closedConvs = convs.filter((c) => c.status === "completed");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar mapView="profesionales" />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-40">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-white">Mis chats</h1>
          <Link
            href="/profesionales"
            className="text-xs px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            + Nuevo chat
          </Link>
        </div>

        {isAnon && (
          <div className="mb-5 flex items-start gap-3 bg-amber-950/40 border border-amber-800/50 rounded-2xl px-4 py-3">
            <span className="text-amber-400 text-lg leading-none mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-300 mb-0.5">Estás chateando sin cuenta</p>
              <p className="text-xs text-amber-400/80 leading-snug">
                Tus chats solo están guardados en este dispositivo. Si lo perdés o limpiás el navegador, los perdés para siempre.{" "}
                <Link href="/sign-in" className="underline font-semibold text-amber-300 hover:text-amber-200">
                  Creá una cuenta gratis
                </Link>{" "}
                para tenerlos siempre a mano.
              </p>
            </div>
          </div>
        )}

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
                  {activeConvs.map((c) => <ConvCard key={c.id} conv={c} myRole={myRole} onDelete={(id) => setConvs((prev) => prev.filter((x) => x.id !== id))} />)}
                </div>
              </div>
            )}
            {closedConvs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Finalizados ({closedConvs.length})
                </p>
                <div className="flex flex-col gap-2">
                  {closedConvs.map((c) => <ConvCard key={c.id} conv={c} myRole={myRole} onDelete={(id) => setConvs((prev) => prev.filter((x) => x.id !== id))} />)}
                </div>
              </div>
            )}

            <div ref={sentinelRef} className="h-4" />

            {loadingMore && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
