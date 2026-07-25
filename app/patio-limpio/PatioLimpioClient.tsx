"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Trash2, MapPin, Calendar, ChevronDown, Share2, ExternalLink } from "lucide-react";

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

import { API_URL } from "@/lib/api/client";

export default function PatioLimpioClient() {
  const { isDark } = useTheme();
  const [data, setData] = useState<PatioLimpioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";
  const textMut = isDark ? "text-gray-500" : "text-gray-400";
  const greenBg = isDark ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-200";
  const amberBg = isDark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-50 text-amber-700 border-amber-200";

  useEffect(() => {
    fetch(`${API_URL}/api/patio-limpio`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const whatsappShare = () => {
    if (!data) return;
    const lines = [
      `🧹 *Patio Limpio - ${data.mes} ${data.year}*`,
      "",
      ...data.zones.map((z) => `📍 *Zona ${z.zone}*: sacar ${z.sacarFechas} — recolecta ${z.recoleccionDesde}`),
      "",
      `Más info: https://reportesreconquista.com/patio-limpio`,
    ];
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg}`}>
        <Navbar sidebarDisabled />
        <div className="max-w-xl mx-auto px-4 pt-28 pb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-24 rounded-2xl ${cardBg} animate-pulse mb-3`} />
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
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${textPri}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3" style={{ backgroundColor: isDark ? "#16653433" : "#f0fdf4", borderColor: isDark ? "#166534" : "#bbf7d0", color: isDark ? "#4ade80" : "#166534" }}>
            <Trash2 className="w-3.5 h-3.5" />
            Municipalidad de Reconquista
          </div>
          <h1 className={`text-2xl font-black ${textPri}`}>
            Patio Limpio
          </h1>
          <p className={`text-lg font-semibold mt-1 capitalize ${textPri}`}>
            {data.mes} {data.year}
          </p>
        </div>

        {/* Instrucciones */}
        <div className={`p-4 rounded-2xl border ${cardBg} mb-5`}>
          <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {data.instrucciones}
          </p>
          <div className={`mt-3 p-2.5 rounded-xl text-xs ${amberBg}`}>
            <strong>⚠️ Importante:</strong> Sacá los residuos (ramas, pastos, cacharros) solo el <strong>sábado y domingo</strong> que corresponde a tu zona. Si los sacás otro día, podés recibir una multa.
          </div>
        </div>

        {/* Zonas */}
        <div className="grid md:grid-cols-2 gap-3">
          {data.zones.map((z) => (
            <div key={z.zone} className={`rounded-2xl border ${cardBg} overflow-hidden`}>
              <button
                onClick={() => setExpandedZone(expandedZone === z.zone ? null : z.zone)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${greenBg}`}>
                    Zona {z.zone}
                  </span>
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className={textSec}>Sacar: <strong className={textPri}>{z.sacarFechas}</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className={textSec}>Recolecta: <strong className={textPri}>{z.recoleccionDesde}</strong></span>
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 ${textMut} transition-transform ${expandedZone === z.zone ? "rotate-180" : ""}`} />
              </button>

              {expandedZone === z.zone && (
                <div className={`px-4 pb-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mt-3 mb-2 ${textMut}`}>
                    Barrios ({z.barrios.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {z.barrios.map((b) => (
                      <span
                        key={b}
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          isDark ? "bg-gray-800/60 text-gray-400 border-gray-700" : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Compartir por WhatsApp
          </button>

          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Fuente oficial
          </a>
        </div>
      </div>
    </div>
  );
}
