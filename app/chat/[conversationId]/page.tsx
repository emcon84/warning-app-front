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
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string };
  Message: Message[];
}

function getLocalClientToken(): string | null {
  return localStorage.getItem("clientToken");
}

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

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

      // Determinar sender:
      // 1. Logueado y clientToken de la conv = userId -> es cliente logueado
      // 2. Logueado y clientToken != userId -> es profesional
      // 3. No logueado -> checar localStorage
      if (isSignedIn && userId) {
        if (data.clientToken === userId) {
          setSenderType("client");
          setWsToken(resolvedToken);
        } else {
          setSenderType("professional");
          setWsToken(resolvedToken);
        }
      } else {
        // usuario anonimo: siempre es cliente
        const anonToken = getLocalClientToken();
        if (!anonToken || data.clientToken !== anonToken) {
          // Este usuario no tiene acceso a esta conversacion
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
              // evitar duplicados
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversation) return null;

  const pro = conversation.Professional;
  const isCompleted = conversation.status === "completed";
  const isAgreed = conversation.status === "agreed";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      {/* Header del chat */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-gray-950 border-b border-gray-800 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center font-bold text-sm text-gray-300">
            {pro.foto
              ? <img src={pro.foto} alt="" className="w-full h-full object-cover" />
              : pro.nombre[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white leading-tight">{pro.nombre} {pro.apellido}</p>
            <p className="text-xs text-gray-500 capitalize">{pro.oficios[0]}</p>
          </div>

          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-600"}`} title={connected ? "Conectado" : "Sin conexión"} />
        </div>
      </div>

      {/* Banner para usuarios anonimos */}
      {!isSignedIn && <AnonymousChatBanner />}

      {/* Estado de la conversacion */}
      {(isAgreed || isCompleted) && (
        <div className="fixed top-28 left-0 right-0 z-40 px-4">
          <div className={`max-w-xl mx-auto py-2 px-4 rounded-xl text-xs text-center ${
            isCompleted
              ? "bg-gray-800 border border-gray-700 text-gray-400"
              : "bg-green-900/40 border border-green-800 text-green-400"
          }`}>
            {isCompleted ? "Conversación finalizada" : "¡Trato acordado! Podés compartir tu contacto."}
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
            <p className="text-center text-sm text-gray-600 py-8">Sin mensajes aún.</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderType === senderType;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-white text-gray-950 rounded-br-sm"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? "text-gray-500" : "text-gray-500"}`}>
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
        <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-3">
          <div className="max-w-xl mx-auto flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí un mensaje..."
              rows={1}
              style={{ color: "#f9fafb" }}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500 resize-none max-h-32 overflow-y-auto"
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
      )}
    </div>
  );
}
