"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";
import AnonymousChatBanner from "../../components/AnonymousChatBanner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

interface Message {
  id: string;
  conversationId: string;
  senderType: "client" | "professional";
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  status: "open" | "agreed" | "completed";
  clientToken: string;
  professionalId: string;
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string; whatsapp?: string };
  Message: Message[];
}

function getLocalClientToken(): string | null {
  return localStorage.getItem("clientToken");
}

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const [isDark, setIsDark] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [senderType, setSenderType] = useState<"client" | "professional" | null>(null);
  const [wsToken, setWsToken] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setIsDark(stored !== "light");

    function onStorage(e: StorageEvent) {
      if (e.key === "theme") setIsDark(e.newValue !== "light");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Cargar conversacion
  useEffect(() => {
    if (!isLoaded) return;

    async function load() {
      let headers: Record<string, string> = {};
      let resolvedToken: string | null = null;

      if (isSignedIn) {
        const clerkToken = await getToken();
        if (clerkToken) headers = { Authorization: `Bearer ${clerkToken}` };
        resolvedToken = clerkToken;
      }

      const res = await fetch(`${API}/api/conversations/${conversationId}`, { headers });
      if (!res.ok) { router.push("/profesionales"); return; }
      const data: Conversation = await res.json();
      setConversation(data);
      setMessages(data.Message || []);

      if (isSignedIn && userId) {
        if (data.clientToken === userId) {
          setSenderType("client");
          setWsToken(resolvedToken);
        } else {
          setSenderType("professional");
          setWsToken(resolvedToken);
        }
      } else {
        const anonToken = getLocalClientToken();
        if (!anonToken || data.clientToken !== anonToken) {
          router.push("/profesionales");
          return;
        }
        setSenderType("client");
        setWsToken(anonToken);
      }

      setLoading(false);
    }

    load().catch(() => { router.push("/profesionales"); });
  }, [isLoaded, isSignedIn, conversationId]);

  // Conectar WebSocket
  useEffect(() => {
    if (!senderType || !conversation || !wsToken) return;

    function connect() {
      const wsUrl = `${WS_URL}/ws?conversationId=${conversation!.id}&token=${encodeURIComponent(wsToken!)}&senderType=${senderType}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "message") {
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.data.id)) return prev;
              return [...prev, msg.data];
            });
          }
        } catch {}
      };

      wsRef.current = ws;
    }

    connect();
    return () => { wsRef.current?.close(); };
  }, [senderType, conversation, wsToken]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const content = input.trim();
    if (!content || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content }));
    setInput("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Theme helpers
  const bg       = isDark ? "bg-gray-950" : "bg-gray-50";
  const headerBg = isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec  = isDark ? "text-gray-500" : "text-gray-500";
  const inputBg  = isDark ? "#111827" : "#ffffff";
  const inputCls = isDark
    ? "bg-gray-900 border-gray-700 placeholder-gray-600 focus:border-gray-500"
    : "bg-white border-gray-200 placeholder-gray-400 focus:border-gray-400";
  const footerBg = isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200";
  const avatarBg = isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600";

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-gray-700 border-t-white" : "border-gray-200 border-t-gray-700"}`} />
      </div>
    );
  }

  if (!conversation) return null;

  const pro = conversation.Professional;
  const isCompleted = conversation.status === "completed";
  const isAgreed = conversation.status === "agreed";

  const shouldShowWhatsApp = senderType === "client"
    && conversation.Professional.whatsapp
    && messages.length > 0
    && messages[messages.length - 1].senderType === "client"
    && Date.now() - new Date(messages[0].createdAt).getTime() > 30 * 60 * 1000;

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} flex flex-col`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      {/* Header del chat */}
      <div className={`fixed top-14 left-0 right-0 z-40 border-b px-4 py-3 ${headerBg}`}>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className={`transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sm ${avatarBg}`}>
            {pro.foto
              ? <img src={pro.foto} alt="" className="w-full h-full object-cover" />
              : pro.nombre[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm leading-tight ${textPrimary}`}>{pro.nombre} {pro.apellido}</p>
            <p className={`text-xs capitalize ${textSec}`}>{pro.oficios[0]}</p>
          </div>

          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} title={connected ? "Conectado" : "Sin conexion"} />
        </div>
      </div>

      {/* Banner para usuarios anonimos */}
      {!isSignedIn && <AnonymousChatBanner />}

      {/* Estado de la conversacion */}
      {(isAgreed || isCompleted) && (
        <div className="fixed top-28 left-0 right-0 z-40 px-4">
          <div className={`max-w-xl mx-auto py-2 px-4 rounded-xl text-xs text-center border ${
            isCompleted
              ? isDark ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"
              : isDark ? "bg-green-900/40 border-green-800 text-green-400" : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {isCompleted ? "Conversacion finalizada" : "Trato acordado! Podes compartir tu contacto."}
          </div>
        </div>
      )}

      {/* Mensajes */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-32"
        style={{ paddingTop: !isSignedIn ? (isAgreed || isCompleted ? "12rem" : "10rem") : (isAgreed || isCompleted ? "9rem" : "7rem") }}
      >
        <div className="max-w-xl mx-auto flex flex-col gap-2 py-4">
          {messages.length === 0 && (
            <p className={`text-center text-sm py-8 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Sin mensajes aun.</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderType === senderType;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-white text-gray-950 rounded-br-sm"
                      : isDark ? "bg-gray-800 text-gray-100 rounded-bl-sm" : "bg-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      {!isCompleted && (
        <div className={`fixed bottom-0 left-0 right-0 border-t ${footerBg}`}>
          {shouldShowWhatsApp && (
            <div className={`px-4 py-2 flex items-center gap-2 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
              <p className={`text-xs flex-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>El profesional no respondio aun.</p>
              <a
                href={`https://wa.me/${conversation.Professional.whatsapp}?text=${encodeURIComponent(`Hola! Te escribo desde Reportes Reconquista.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-700/30 hover:bg-green-700/50 border border-green-700/50 text-green-400 text-xs font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Escribir por WhatsApp
              </a>
            </div>
          )}
          <div className="px-4 py-3">
            <div className="max-w-xl mx-auto flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                style={{ color: isDark ? "#f9fafb" : "#111827", backgroundColor: inputBg }}
                className={`flex-1 px-4 py-2.5 rounded-2xl border text-sm focus:outline-none resize-none max-h-32 overflow-y-auto ${inputCls}`}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !connected}
                className="w-10 h-10 rounded-full bg-white text-gray-950 flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
