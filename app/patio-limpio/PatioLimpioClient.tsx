"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Trash2, Calendar, Search, Share2, ExternalLink, MapPin } from "lucide-react";
import { API_URL } from "@/lib/api/client";

interface PatioLimpioZone {
  zone: string;
  barrios: string[];
  sacarFechas: string;
  recoleccionDesde: string;
}

interface PatioLimpioData {
  mes: string;
  year: number;
  sourceUrl: string;
  instrucciones: string;
  zones: PatioLimpioZone[];
  fetchedAt: string;
}

const BANNER_URL = "https://reconquista.gob.ar/wp-content/uploads/2026/07/Patio-Limpio-MENSUAL_FEED_01-2.png";

export default function PatioLimpioClient() {
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PatioLimpioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("barrio") ?? "");

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMut = isDark ? "text-gray-500" : "text-gray-400";
  const greenBg = isDark ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-200";
  const amberBg = isDark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-700 border-amber-200";
  const zoneColors: Record<string, string> = {
    A: isDark ? "border-l-blue-500 bg-blue-500/5" : "border-l-blue-500 bg-blue-50",
    C: isDark ? "border-l-green-500 bg-green-500/5" : "border-l-green-500 bg-green-50",
    D: isDark ? "border-l-purple-500 bg-purple-500/5" : "border-l-purple-500 bg-purple-50",
    E: isDark ? "border-l-amber-500 bg-amber-500/5" : "border-l-amber-500 bg-amber-50",
  };

  useEffect(() => {
    fetch(`${API_URL}/api/patio-limpio`)
      .then((r) => r.json())
      .then((d) => { if (d.error) throw new Error(d.error); setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredZones = data?.zones.filter((z) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return z.barrios.some((b) => b.toLowerCase().includes(q)) || z.zone.toLowerCase() === q;
  }) ?? [];

  const foundZone = search.trim()
    ? data?.zones.find((z) => z.barrios.some((b) => b.toLowerCase().includes(search.toLowerCase()))) ?? null
    : null;

  const whatsappShare = () => {
    if (!data) return;
    const shareUrl = foundZone
      ? `https://reportesreconquista.com/patio-limpio?barrio=${encodeURIComponent(search.trim())}`
      : "https://reportesreconquista.com/patio-limpio";

    if (foundZone) {
      const msg = [
        `Patio Limpio - ${data.mes} ${data.year}`,
        ``,
        `${search.trim()} está en la Zona ${foundZone.zone}`,
        ``,
        `Sacar los residuos: ${foundZone.sacarFechas}`,
        `La recolección se realiza el ${foundZone.recoleccionDesde}`,
        ``,
        `Solamente sábado y domingo. Si sacás otro día, podés recibir una multa.`,
        ``,
        `Más info: ${shareUrl}`,
      ];
      window.open(`https://wa.me/?text=${encodeURIComponent(msg.join("\n"))}`, "_blank");
    } else {
      const msg = [
        `Patio Limpio - ${data.mes} ${data.year}`,
        ``,
        ...data.zones.map((z) => `Zona ${z.zone}: sacar ${z.sacarFechas} — recolecta ${z.recoleccionDesde}`),
        ``,
        `Más info: ${shareUrl}`,
      ];
      window.open(`https://wa.me/?text=${encodeURIComponent(msg.join("\n"))}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg}`}>
        <Navbar sidebarDisabled />
        <div className="max-w-xl md:max-w-4xl mx-auto px-4 pt-28 pb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-32 rounded-2xl ${cardBg} animate-pulse mb-3`} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen ${bg} ${textPri}`}>
        <Navbar sidebarDisabled />
        <div className="max-w-xl mx-auto px-4 pt-28 text-center">
          <Trash2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-semibold">No pudimos cargar el cronograma</p>
          <p className={`text-sm mt-1 ${textMut}`}>{error || "Intentá de nuevo más tarde"}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${textPri}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl md:max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Banner */}
        <div className="rounded-2xl overflow-hidden mb-6 shadow-lg">
          <img src={BANNER_URL} alt="Patio Limpio" className="w-full h-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3" style={{ backgroundColor: isDark ? "#16653433" : "#f0fdf4", borderColor: isDark ? "#166534" : "#bbf7d0", color: isDark ? "#4ade80" : "#166534" }}>
            <Trash2 className="w-3.5 h-3.5" /> Municipalidad de Reconquista
          </div>
          <h1 className={`text-2xl font-black ${textPri}`}>Patio Limpio</h1>
          <p className={`text-lg font-semibold mt-1 capitalize ${textPri}`}>{data.mes} {data.year}</p>
        </div>

        {/* Instrucciones */}
        <div className={`p-4 rounded-2xl border ${cardBg} mb-5`}>
          <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{data.instrucciones}</p>
          <div className={`mt-3 p-2.5 rounded-xl text-xs ${amberBg}`}>
            <strong>⚠️ Importante:</strong> Sacá los residuos solo el <strong>sábado y domingo</strong> de tu zona. Si los sacás otro día, podés recibir una multa.
          </div>
        </div>

        {/* Buscar barrio */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tu barrio para saber qué zona te toca..."
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
          />
          {search && (
            <div className={`mb-5 p-4 rounded-2xl border ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
              {foundZone ? (
                <div>
                  <p className={`text-sm font-bold ${isDark ? "text-green-400" : "text-green-800"}`}>
                    {search.trim()} está en la <span className="underline">Zona {foundZone.zone}</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                      <strong>Sacar los residuos:</strong> {foundZone.sacarFechas}
                    </p>
                    <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                      <strong>La recolección se realiza el:</strong> {foundZone.recoleccionDesde}
                    </p>
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                    Sacá los residuos solo el sábado y domingo de tu zona. Si los sacás otro día, podés recibir una multa.
                  </p>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  No se encontró "{search.trim()}". Probá con otro nombre.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Zonas */}
        <div className="space-y-4">
          {(search ? filteredZones : data.zones).map((z) => (
            <div
              key={z.zone}
              className={`rounded-2xl border-l-4 ${cardBg} ${zoneColors[z.zone] || ""} overflow-hidden`}
            >
              {/* Zone header */}
              <div className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black px-3 py-1 rounded-lg border ${greenBg}`}>
                      Zona {z.zone}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:gap-4">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className={textSec}>Sacar: <strong className={textPri}>{z.sacarFechas}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Trash2 className="w-4 h-4 text-amber-500" />
                        <span className={textSec}>Recolecta: <strong className={textPri}>{z.recoleccionDesde}</strong></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barrios */}
                <div className="mt-4">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textMut}`}>
                    Barrios ({z.barrios.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {z.barrios.map((b) => {
                      const highlighted = search && b.toLowerCase().includes(search.toLowerCase());
                      return (
                        <span
                          key={b}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                            highlighted
                              ? "bg-green-500/20 text-green-400 border-green-500/40"
                              : isDark
                                ? "bg-gray-800/60 text-gray-300 border-gray-700"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {b}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={whatsappShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Compartir por WhatsApp
          </button>
          <a href={foundZone ? `${data.sourceUrl}` : data.sourceUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <ExternalLink className="w-4 h-4" /> Fuente oficial
          </a>
        </div>
      </div>
    </div>
  );
}
