"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Send, UserPlus } from "lucide-react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";

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
  clientName?: string;
  professionalId: string;
  Professional: { nombre: string; apellido: string; oficios: string[]; foto?: string; slug: string; whatsapp?: string };
  Message: Message[];
}

function getLocalClientToken(): string | null {
  return localStorage.getItem("clientToken");
}

function MessageTicks({ read, onDark }: { read: boolean; onDark: boolean }) {
  // Ticks SVG: simple check path, dos superpuestos para doble tick
  const color = read
    ? onDark ? "#a5b4fc" : "#22c55e"   // indigo-300 sobre azul / green-500 sobre blanco
    : onDark ? "#818cf8" : "#9ca3af";  // indigo-400 (opaco) / gray-400

  if (read) {
    return (
      <svg width="18" height="11" viewBox="0 0 18 11" fill="none" className="ml-0.5 flex-shrink-0">
        <path d="M1 5.5L4.5 9L10 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 5.5L9.5 9L17 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="ml-0.5 flex-shrink-0">
      <path d="M1 5.5L4.5 9L10 1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TypingBubble({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex justify-start">
      <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
        <div className="flex gap-1 items-center">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-gray-500" : "bg-gray-400"}`}
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const { isDark } = useTheme();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [senderType, setSenderType] = useState<"client" | "professional" | null>(null);
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Refs para reconexión (evitar closures stale)
  const conversationRef = useRef<Conversation | null>(null);
  const wsTokenRef = useRef<string | null>(null);
  const senderTypeRef = useRef<"client" | "professional" | null>(null);
  const manualCloseRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const getTokenRef = useRef(getToken);
  const isSignedInRef = useRef(isSignedIn);

  // Sincronizar refs con estado
  useEffect(() => { conversationRef.current = conversation; }, [conversation]);
  useEffect(() => { wsTokenRef.current = wsToken; }, [wsToken]);
  useEffect(() => { senderTypeRef.current = senderType; }, [senderType]);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);
  useEffect(() => { isSignedInRef.current = isSignedIn; }, [isSignedIn]);

  // Función de conexión WebSocket (estable, lee estado via refs)
  const connectWS = useCallback(async () => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    const conv = conversationRef.current;
    const sender = senderTypeRef.current;
    if (!conv || !sender) return;

    // Refrescar token de Clerk en cada reconexión (expiran ~1 min)
    let token = wsTokenRef.current;
    if (isSignedInRef.current) {
      const fresh = await getTokenRef.current();
      if (fresh) {
        token = fresh;
        wsTokenRef.current = fresh;
      }
    }

    if (!token) return;

    if (wsRef.current && wsRef.current.readyState < 2) {
      manualCloseRef.current = true;
      wsRef.current.close();
    }
    manualCloseRef.current = false;

    const wsUrl = `${WS_URL}/ws?conversationId=${conv.id}&token=${encodeURIComponent(token)}&senderType=${sender}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);

    ws.onclose = () => {
      setConnected(false);
      if (!manualCloseRef.current) {
        // Reconectar en 3 segundos
        reconnectTimerRef.current = setTimeout(connectWS, 3000);
      }
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === "message") {
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.data.id)) return prev;
            return [...prev, msg.data];
          });
          // Auto-marcar como leído si el mensaje es del otro lado y el chat está visible
          if (msg.data.senderType !== senderTypeRef.current && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "mark_read" }));
          }
        } else if (msg.type === "typing") {
          if (msg.senderType !== senderTypeRef.current) {
            setPeerTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000);
          }
        } else if (msg.type === "read") {
          setMessages((prev) =>
            prev.map((m) => m.senderType === msg.senderType ? { ...m, read: true } : m)
          );
        }
      } catch {}
    };

    wsRef.current = ws;
  }, []);

  // Reconectar al volver de background (celular desbloqueado)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        const ws = wsRef.current;
        if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          connectWS();
        }
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [connectWS]);

  // Tick cada minuto para re-evaluar shouldShowWhatsApp
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Guardar conversationId en localStorage para usuarios anónimos (para poder recuperarla)
  useEffect(() => {
    if (!isSignedIn && conversationId && conversation) {
      localStorage.setItem("lastAnonChat", JSON.stringify({
        id: conversationId,
        professionalName: `${conversation.Professional.nombre} ${conversation.Professional.apellido}`,
        officio: conversation.Professional.oficios[0] ?? "",
      }));
    }
  }, [isSignedIn, conversationId, conversation]);

  // Advertir antes de cerrar la pestaña (desktop)
  useEffect(() => {
    if (isSignedIn) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isSignedIn]);

  // Cargar conversación
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

  // Conectar WebSocket cuando tenemos todo lo necesario
  useEffect(() => {
    if (!senderType || !conversation || !wsToken) return;
    connectWS();
    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [senderType, conversation, wsToken, connectWS]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  function handleInputChange(value: string) {
    setInput(value);
    // Enviar evento de typing (máx una vez cada 2 seg)
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000 && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
      lastTypingSentRef.current = now;
    }
  }

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
  function handleBack() {
    if (!isSignedIn) {
      setShowExitWarning(true);
    } else {
      router.back();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  }

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

  const professionalEverResponded = messages.some(m => m.senderType === "professional");
  const shouldShowWhatsApp = senderType === "client"
    && conversation.Professional.whatsapp
    && messages.length > 0
    && !professionalEverResponded
    && messages[messages.length - 1].senderType === "client"
    && now - new Date(messages[0].createdAt).getTime() > 10 * 60 * 1000;

  return (
    <div className={`h-[100dvh] ${bg} ${textPrimary} flex flex-col`}>

      {/* Modal advertencia salida anónimo */}
      {showExitWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" onClick={() => setShowExitWarning(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className={`relative rounded-2xl border p-6 max-w-sm w-full flex flex-col gap-4 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${isDark ? "bg-yellow-900/30 border border-yellow-700" : "bg-yellow-50 border border-yellow-200"}`}>
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Si salis, perdes el chat</h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Como usuario anonimo no vas a poder volver a este chat. Guarda el link antes de salir.
              </p>
            </div>
            <button
              onClick={copyLink}
              className={`w-full py-3 rounded-2xl font-semibold text-sm border transition-colors ${
                isDark ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700" : "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {linkCopied ? "Link copiado!" : "Copiar link del chat"}
            </button>
            <button
              onClick={() => { setShowExitWarning(false); router.back(); }}
              className="w-full py-3 rounded-2xl bg-white text-gray-950 font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Salir igual
            </button>
            <button
              onClick={() => setShowExitWarning(false)}
              className={`text-sm text-center transition-colors ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
            >
              Quedarme en el chat
            </button>
          </div>
        </div>
      )}

      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />

      {/* Header del chat */}
      <div className={`fixed top-14 left-0 right-0 z-40 border-b px-4 py-3 ${headerBg}`}>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={handleBack} className={`transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
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
            {senderType === "professional" ? (
              <>
                <p className={`font-semibold text-sm leading-tight ${textPrimary}`}>
                  {conversation.clientName || "Cliente anónimo"}
                </p>
                <p className={`text-xs ${textSec}`}>Consulta vía Reportes Reconquista</p>
              </>
            ) : (
              <>
                <p className={`font-semibold text-sm leading-tight ${textPrimary}`}>{pro.nombre} {pro.apellido}</p>
                <p className={`text-xs capitalize ${textSec}`}>{pro.oficios[0]}</p>
              </>
            )}
          </div>

          <div
            className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-green-500" : "bg-gray-500"}`}
            title={connected ? "Conectado" : "Reconectando..."}
          />
        </div>
      </div>

      {/* Estado de la conversación */}
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
        style={{ paddingTop: isAgreed || isCompleted ? "10rem" : "8rem" }}
      >
        <div className="max-w-xl mx-auto flex flex-col gap-2 py-4">

          {/* Banner anónimo inline (no fixed) */}
          {!isSignedIn && (
            <div className={`flex items-center gap-3 mb-2 px-3 py-2.5 rounded-xl border ${isDark ? "bg-blue-950/50 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
              <UserPlus className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <p className={`flex-1 text-xs ${isDark ? "text-blue-200" : "text-blue-700"}`}>
                Queres guardar tus chats y ver tus favoritos?
              </p>
              <Link
                href="/sign-up"
                className={`flex-shrink-0 text-xs font-semibold border rounded-lg px-2.5 py-1 transition-colors ${isDark ? "text-blue-400 border-blue-700 hover:text-blue-300" : "text-blue-600 border-blue-300 hover:text-blue-500"}`}
              >
                Crear cuenta
              </Link>
            </div>
          )}

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
                      ? isDark
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-white text-gray-950 rounded-br-sm shadow-sm border border-gray-100"
                      : isDark
                        ? "bg-gray-800 text-gray-100 rounded-bl-sm"
                        : "bg-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={`flex items-center gap-0.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                    <p className={`text-xs ${
                      isMine
                        ? isDark ? "text-indigo-200" : "text-gray-400"
                        : isDark ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {isMine && <MessageTicks read={msg.read} onDark={isDark} />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {peerTyping && <TypingBubble isDark={isDark} />}

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
          <div className="px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <div className="max-w-xl mx-auto flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
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
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
