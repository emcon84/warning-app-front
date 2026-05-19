"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import {
  Users, QrCode, Trophy, Play, Loader2, Printer, Download, Sparkles,
  UtensilsCrossed, Plus, Trash2, Save, X, Camera, Check,
} from "lucide-react";
import { API_URL } from "@/lib/api/client";
import { useConfetti } from "@/hooks/useConfetti";
import { resolvePhotoUrl } from "@/lib/utils/photo";

type Tab = "barra" | "qr" | "asistentes" | "sorteo";

interface Participante {
  id:        string;
  numero:    number;
  nombre:    string;
  createdAt: string;
}

interface SorteoStatus {
  tieneSorteo:         boolean;
  sorteoEjecutado:     boolean;
  sorteoGanadorNum:    number | null;
  sorteoGanadorNombre: string | null;
  sorteoPremio:        string | null;
  totalParticipantes:  number;
  miNumero:            number | null;
}

interface BarraProduct {
  id:          string;
  nombre:      string;
  descripcion: string | null;
  precio:      string;
  foto:        string | null;
  disponible:  boolean;
  orden:       number;
}

interface Props {
  slug:         string;
  eventoNombre: string;
  isDark:       boolean;
  getToken:     () => Promise<string | null>;
}

function padNum(n: number) { return n.toString().padStart(3, "0"); }

// ── Slot Machine ──────────────────────────────────────────────────────────────
function SlotMachine({ total, ganador, onClose, isDark }: {
  total: number; ganador: { numero: number; nombre: string } | null; onClose: () => void; isDark: boolean;
}) {
  const { fire } = useConfetti();
  const [phase,   setPhase]   = useState<"spinning" | "slowing" | "done">("spinning");
  const [display, setDisplay] = useState("000");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!ganador) return;
    let speed = 60, elapsed = 0;
    const duration = 4200;
    function tick() {
      setDisplay(padNum(Math.floor(Math.random() * Math.max(total, 10)) + 1));
      elapsed += speed;
      if (elapsed < duration * 0.5)       speed = 60;
      else if (elapsed < duration * 0.75) { speed = 130; setPhase("slowing"); }
      else if (elapsed < duration)        speed = 260;
      else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(padNum(ganador!.numero));
        setPhase("done");
        setTimeout(() => fire(), 300);
        return;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, speed);
    }
    intervalRef.current = setInterval(tick, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [ganador, total, fire]);

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-8 px-8 text-center">
        <Sparkles className={`w-10 h-10 animate-pulse ${phase === "done" ? "text-amber-400" : "text-indigo-400"}`} />
        <h2 className="text-white text-2xl font-black">
          {phase === "done" ? "El numero ganador es..." : "Sorteando..."}
        </h2>
        <div className={`relative flex items-center justify-center w-64 h-64 rounded-3xl border-4 transition-all duration-500 ${
          phase === "done"
            ? "border-amber-400 bg-amber-500/20 shadow-[0_0_80px_rgba(251,191,36,0.5)]"
            : "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
        }`}>
          <span className={`font-black tracking-widest tabular-nums transition-all duration-300 ${
            phase === "done" ? "text-9xl text-amber-400" : "text-8xl text-white"
          }`}>{display}</span>
          {phase !== "done" && <>
            <div className="absolute top-0 left-0 right-0 h-12 rounded-t-3xl bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </>}
        </div>
        {phase === "done" && ganador && (
          <div className="flex flex-col items-center gap-3 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-400" />
            <p className="text-white text-3xl font-black">{ganador.nombre}</p>
            <p className="text-amber-400 text-lg font-semibold">Felicitaciones!</p>
          </div>
        )}
        {phase !== "done" && <p className="text-white/50 text-sm">{total} asistentes registrados</p>}
        {phase === "done" && (
          <button onClick={onClose} className="mt-4 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export function EventoOrganizadorPanel({ slug, eventoNombre, isDark, getToken }: Props) {
  const [tab,           setTab]           = useState<Tab>("barra");
  const [status,        setStatus]        = useState<SorteoStatus | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loadingP,      setLoadingP]      = useState(false);
  const [running,       setRunning]       = useState(false);
  const [showSlot,      setShowSlot]      = useState(false);
  const [ganador,       setGanador]       = useState<{ numero: number; nombre: string } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Barra state
  const [productos,     setProductos]     = useState<BarraProduct[]>([]);
  const [mpAlias,       setMpAlias]       = useState<string | null>(null);
  const [mpAliasInput,  setMpAliasInput]  = useState("");
  const [loadingBarra,  setLoadingBarra]  = useState(false);
  const [savingAlias,   setSavingAlias]   = useState(false);
  const [savedAlias,    setSavedAlias]    = useState(false);
  const [showAddForm,   setShowAddForm]   = useState(false);
  const [addNombre,     setAddNombre]     = useState("");
  const [addPrecio,     setAddPrecio]     = useState("");
  const [addDesc,       setAddDesc]       = useState("");
  const [addFoto,       setAddFoto]       = useState<File | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  const checkInUrl = typeof window !== "undefined"
    ? `${window.location.origin}/evento/${slug}/check-in`
    : `https://reportesreconquista.com/evento/${slug}/check-in`;

  const card    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";
  const inp     = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-indigo-400";
  const tabBase     = `flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-xl transition-all`;
  const tabActive   = `bg-indigo-500 text-white`;
  const tabInactive = isDark ? `text-gray-400 hover:text-gray-200` : `text-gray-500 hover:text-gray-700`;

  // Load sorteo status
  useEffect(() => {
    (async () => {
      const token = await getToken().catch(() => null);
      const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (res?.ok) setStatus(await res.json());
    })();
  }, [slug]);

  // Load barra when on that tab
  useEffect(() => {
    if (tab !== "barra") return;
    (async () => {
      setLoadingBarra(true);
      const token = await getToken().catch(() => null);
      const res = await fetch(`${API_URL}/api/eventos/${slug}/barra`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setProductos(data.productos ?? []);
        setMpAlias(data.mpAlias ?? null);
        setMpAliasInput(data.mpAlias ?? "");
      }
      setLoadingBarra(false);
    })();
  }, [tab, slug]);

  // Load participantes when on that tab
  useEffect(() => {
    if (tab !== "asistentes") return;
    (async () => {
      setLoadingP(true);
      const token = await getToken().catch(() => null);
      const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo/participantes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (res?.ok) setParticipantes(await res.json());
      setLoadingP(false);
    })();
  }, [tab, slug]);

  async function handleEjecutar() {
    if (running) return;
    setRunning(true);
    setShowSlot(true);
    setGanador(null);
    const token = await getToken().catch(() => null);
    const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo/ejecutar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    }).catch(() => null);
    if (!res?.ok) { setShowSlot(false); setRunning(false); return; }
    const d = await res.json();
    setGanador({ numero: d.numero, nombre: d.nombre });
    setStatus(prev => prev ? { ...prev, sorteoEjecutado: true, sorteoGanadorNum: d.numero, sorteoGanadorNombre: d.nombre } : prev);
    setRunning(false);
  }

  async function handleSaveAlias() {
    setSavingAlias(true);
    const token = await getToken().catch(() => null);
    await fetch(`${API_URL}/api/eventos/${slug}/barra/mp-alias`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ mpAlias: mpAliasInput.trim() || null }),
    }).catch(() => {});
    setMpAlias(mpAliasInput.trim() || null);
    setSavingAlias(false);
    setSavedAlias(true);
    setTimeout(() => setSavedAlias(false), 2000);
  }

  async function handleToggleDisponible(product: BarraProduct) {
    const token = await getToken().catch(() => null);
    const fd = new FormData();
    fd.append("disponible", String(!product.disponible));
    const res = await fetch(`${API_URL}/api/eventos/${slug}/barra/${product.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token ?? ""}` },
      body: fd,
    }).catch(() => null);
    if (res?.ok) {
      const updated = await res.json();
      setProductos(prev => prev.map(p => p.id === product.id ? { ...p, disponible: updated.disponible } : p));
    }
  }

  async function handleDeleteProduct(id: string) {
    const token = await getToken().catch(() => null);
    const res = await fetch(`${API_URL}/api/eventos/${slug}/barra/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    }).catch(() => null);
    if (res?.ok) setProductos(prev => prev.filter(p => p.id !== id));
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!addNombre.trim() || !addPrecio.trim() || addingProduct) return;
    setAddingProduct(true);
    const token = await getToken().catch(() => null);
    const fd = new FormData();
    fd.append("nombre", addNombre.trim());
    fd.append("precio", addPrecio.trim());
    if (addDesc.trim()) fd.append("descripcion", addDesc.trim());
    if (addFoto) fd.append("foto", addFoto);
    const res = await fetch(`${API_URL}/api/eventos/${slug}/barra`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
      body: fd,
    }).catch(() => null);
    if (res?.ok) {
      const nuevo = await res.json();
      setProductos(prev => [...prev, nuevo]);
      setAddNombre(""); setAddPrecio(""); setAddDesc(""); setAddFoto(null);
      setShowAddForm(false);
    }
    setAddingProduct(false);
  }

  function handlePrint() {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Sorteo — ${eventoNombre}</title>
      <style>
        body { margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:system-ui; background:#fff; gap:24px; }
        img { width:280px; height:280px; }
        h2 { font-size:22px; font-weight:900; color:#111; text-align:center; margin:0; }
        p  { font-size:14px; color:#666; text-align:center; margin:0; }
      </style></head>
      <body>
        <h2>${eventoNombre}</h2>
        <img src="${url}" />
        <p>Escaneá este QR para participar en el sorteo</p>
        <p style="font-size:11px;color:#aaa">${checkInUrl}</p>
        <script>window.onload=()=>{window.print();}</script>
      </body></html>
    `);
    win.document.close();
  }

  function handleDownloadQR() {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svg  = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `qr-sorteo-${slug}.svg`;
    a.click();
  }

  const tieneSorteo = status?.tieneSorteo ?? false;

  const tabs: Array<[Tab, React.ReactNode, string]> = [
    ["barra",     <UtensilsCrossed className="w-3.5 h-3.5" />, "Barra"],
    ...(tieneSorteo ? [
      ["qr",        <QrCode className="w-3.5 h-3.5" />,    "QR"]         as [Tab, React.ReactNode, string],
      ["asistentes",<Users className="w-3.5 h-3.5" />,     "Asistentes"] as [Tab, React.ReactNode, string],
      ["sorteo",    <Trophy className="w-3.5 h-3.5" />,    "Sorteo"]     as [Tab, React.ReactNode, string],
    ] : []),
  ];

  return (
    <>
      <div className={`rounded-2xl border overflow-hidden ${card}`}>

        {/* Header */}
        <div className={`px-5 pt-5 pb-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-bold ${textPri}`}>Panel del organizador</h2>
            {tieneSorteo && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                <Users className="w-3.5 h-3.5" />
                {status?.totalParticipantes ?? 0} asistentes
              </div>
            )}
          </div>
          <div className={`flex gap-1 p-1 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            {tabs.map(([t, icon, label]) => (
              <button key={t} onClick={() => setTab(t)} className={`${tabBase} ${tab === t ? tabActive : tabInactive}`}>
                {icon}<span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Barra Tab ─────────────────────────────────────────────────────── */}
        {tab === "barra" && (
          <div className="p-5 space-y-4">

            {/* MP Alias */}
            <div>
              <p className={`text-xs font-semibold mb-1.5 ${textMut}`}>Alias de Mercado Pago (opcional)</p>
              <div className="flex gap-2">
                <input
                  value={mpAliasInput}
                  onChange={e => setMpAliasInput(e.target.value)}
                  placeholder="tu.alias.mp"
                  className={`flex-1 text-sm px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${inp}`}
                />
                <button
                  onClick={handleSaveAlias}
                  disabled={savingAlias}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    savedAlias
                      ? isDark ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-green-50 text-green-600 border border-green-200"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {savingAlias ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedAlias ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {savedAlias ? "Guardado" : "Guardar"}
                </button>
              </div>
            </div>

            {/* Products header */}
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold ${textMut}`}>
                Productos ({productos.length})
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              )}
            </div>

            {/* Add form */}
            {showAddForm && (
              <form onSubmit={handleAddProduct} className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xs font-bold ${textPri}`}>Nuevo producto</p>
                <input
                  value={addNombre}
                  onChange={e => setAddNombre(e.target.value)}
                  placeholder="Nombre del producto *"
                  required
                  className={`w-full text-sm px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${inp}`}
                />
                <input
                  value={addPrecio}
                  onChange={e => setAddPrecio(e.target.value)}
                  placeholder="Precio (ej: $500 o Gratis) *"
                  required
                  className={`w-full text-sm px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${inp}`}
                />
                <input
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className={`w-full text-sm px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${inp}`}
                />
                <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${
                  isDark ? "border-gray-700 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}>
                  <Camera className="w-3.5 h-3.5" />
                  {addFoto ? addFoto.name : "Agregar foto (opcional)"}
                  <input
                    type="file" accept="image/*" capture="environment"
                    className="hidden"
                    onChange={e => setAddFoto(e.target.files?.[0] ?? null)}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setAddNombre(""); setAddPrecio(""); setAddDesc(""); setAddFoto(null); }}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-colors ${isDark ? "border border-gray-700 text-gray-400 hover:bg-gray-700" : "border border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={addingProduct || !addNombre.trim() || !addPrecio.trim()}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {addingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Agregar
                  </button>
                </div>
              </form>
            )}

            {/* Product list */}
            {loadingBarra ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>
            ) : productos.length === 0 && !showAddForm ? (
              <div className={`py-8 text-center rounded-2xl border ${isDark ? "border-gray-800 bg-gray-800/30" : "border-gray-100 bg-gray-50"}`}>
                <UtensilsCrossed className={`w-8 h-8 mx-auto mb-2 ${textMut}`} />
                <p className={`text-sm font-semibold ${textPri}`}>Sin productos aún</p>
                <p className={`text-xs mt-1 ${textMut}`}>Agregá lo que se vende en la barra</p>
              </div>
            ) : (
              <div className="space-y-2">
                {productos.map(p => (
                  <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                    {p.foto ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={resolvePhotoUrl(p.foto)} alt={p.nombre} width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                        🍺
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${textPri}`}>{p.nombre}</p>
                      <p className={`text-xs font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>{p.precio}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleDisponible(p)}
                        title={p.disponible ? "Marcar agotado" : "Marcar disponible"}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                          p.disponible
                            ? isDark ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-100 text-green-600 hover:bg-green-200"
                            : isDark ? "bg-gray-700 text-gray-500 hover:bg-gray-600" : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        }`}
                      >
                        {p.disponible ? "✓" : "✗"}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-600 hover:text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── QR Tab ────────────────────────────────────────────────────────── */}
        {tab === "qr" && (
          <div className="p-5 flex flex-col items-center gap-4">
            <p className={`text-xs text-center ${textMut}`}>
              Imprimí este QR y ponelo en el evento. Los asistentes lo escanean para obtener su número de sorteo.
            </p>
            <div ref={qrRef} className="p-4 rounded-2xl bg-white">
              <QRCode value={checkInUrl} size={200} fgColor="#111" bgColor="#fff" />
            </div>
            <p className={`text-xs text-center font-mono break-all ${isDark ? "text-gray-600" : "text-gray-300"}`}>
              {checkInUrl}
            </p>
            <div className="flex gap-2 w-full">
              <button onClick={handleDownloadQR} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                <Download className="w-3.5 h-3.5" /> Descargar SVG
              </button>
              <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors">
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
            </div>
          </div>
        )}

        {/* ── Asistentes Tab ────────────────────────────────────────────────── */}
        {tab === "asistentes" && (
          <div className="p-5">
            {loadingP ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
            ) : participantes.length === 0 ? (
              <div className="py-10 text-center">
                <QrCode className={`w-10 h-10 mx-auto mb-2 ${textMut}`} />
                <p className={`text-sm font-semibold ${textPri}`}>Sin asistentes aún</p>
                <p className={`text-xs mt-1 ${textMut}`}>Cuando escaneen el QR van a aparecer acá</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`rounded-xl p-3 text-center ${isDark ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                    <p className="text-2xl font-black text-indigo-400">{participantes.length}</p>
                    <p className={`text-xs ${textMut}`}>Asistentes</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${isDark ? "bg-amber-500/10" : "bg-amber-50"}`}>
                    <p className="text-2xl font-black text-amber-400">#{padNum(participantes[participantes.length - 1]?.numero ?? 0)}</p>
                    <p className={`text-xs ${textMut}`}>Ultimo numero</p>
                  </div>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {[...participantes].reverse().map(p => (
                    <div key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                      <span className="text-sm font-black text-indigo-400 w-10 tabular-nums">{padNum(p.numero)}</span>
                      <span className={`text-sm flex-1 ${textPri}`}>{p.nombre}</span>
                      <span className={`text-xs ${textMut}`}>{new Date(p.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Sorteo Tab ────────────────────────────────────────────────────── */}
        {tab === "sorteo" && status && (
          <div className="p-5 space-y-4">
            {status.sorteoEjecutado ? (
              <div className={`rounded-2xl p-5 text-center ${isDark ? "bg-amber-500/10 border border-amber-500/30" : "bg-amber-50 border border-amber-200"}`}>
                <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-amber-500" : "text-amber-600"}`}>Ganador</p>
                <p className="text-5xl font-black text-amber-400 mb-1">{padNum(status.sorteoGanadorNum!)}</p>
                <p className={`text-base font-bold ${textPri}`}>{status.sorteoGanadorNombre}</p>
              </div>
            ) : (
              <>
                {status.sorteoPremio && (
                  <div className={`rounded-xl p-3 flex items-center gap-2 ${isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
                    <span className="text-xl">🎁</span>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-amber-500" : "text-amber-700"}`}>Se sortea</p>
                      <p className={`text-sm font-bold ${isDark ? "text-amber-300" : "text-amber-800"}`}>{status.sorteoPremio}</p>
                    </div>
                  </div>
                )}
                <div className={`rounded-xl p-4 text-center ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className="text-3xl font-black text-indigo-400 mb-1">{status.totalParticipantes}</p>
                  <p className={`text-xs ${textMut}`}>asistentes en el sorteo</p>
                </div>
                <button
                  onClick={handleEjecutar}
                  disabled={running || status.totalParticipantes === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-colors ${
                    status.totalParticipantes === 0
                      ? isDark ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                  }`}
                >
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {running ? "Ejecutando..." : status.totalParticipantes === 0 ? "Sin asistentes aún" : "Ejecutar sorteo"}
                </button>
                {status.totalParticipantes > 0 && (
                  <p className={`text-xs text-center ${textMut}`}>
                    Se va a sortear entre {status.totalParticipantes} asistente{status.totalParticipantes !== 1 ? "s" : ""}. Esta acción no se puede deshacer.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showSlot && status && (
        <SlotMachine
          total={status.totalParticipantes}
          ganador={ganador}
          isDark={isDark}
          onClose={() => setShowSlot(false)}
        />
      )}
    </>
  );
}
