"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Banknote, Briefcase, ArrowLeft, CheckCircle, Phone, MessageCircle } from "lucide-react";
import { Vacante } from "@/types";
import Navbar from "@/components/Navbar";
import ShareButton from "@/components/ShareButton";
import { useTheme } from "@/contexts/ThemeContext";

import { API_URL } from "@/lib/api/client";

function getOrCreateClientToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem("clientToken");
  if (!token) {
    token = `client_${crypto.randomUUID()}`;
    localStorage.setItem("clientToken", token);
  }
  return token;
}

interface PostularModalProps {
  vacante: Vacante;
  isDark: boolean;
  onClose: () => void;
  onSent: (convId: string) => void;
}

function PostularModal({ vacante, isDark, onClose, onSent }: PostularModalProps) {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500";

  async function handleSend() {
    if (!mensaje.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const clientToken = getOrCreateClientToken();
      const res = await fetch(`${API_URL}/api/vacantes/${vacante.id}/conversaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientToken, clientName: nombre.trim() || undefined, mensaje: mensaje.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al enviar");
      }
      const data = await res.json();
      onSent(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-2xl border p-6 ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200 shadow-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          Postularme a esta vacante
        </h3>
        <p className={`text-sm mb-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Tu mensaje le llega directamente a {vacante.comercio.nombre}.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tu nombre (opcional)</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Como te llamas?"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors ${inputClass}`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Mensaje *</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={`Hola! Me interesa la vacante de ${vacante.titulo}. Te cuento un poco sobre mi...`}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors resize-none ${inputClass}`}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={!mensaje.trim() || loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? "Enviando..." : "Postularme"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VacanteDetailClient({ vacante }: { vacante: Vacante }) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [sentConvId, setSentConvId] = useState<string | null>(null);

  const bg = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  const metaItems = [
    vacante.barrio && { icon: MapPin, label: vacante.barrio + ", Reconquista" },
    vacante.horario && { icon: Clock, label: vacante.horario },
    vacante.salario && { icon: Banknote, label: vacante.salario },
    vacante.modalidad && { icon: Briefcase, label: vacante.modalidad },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  return (
    <div className={`min-h-screen pb-40 md:pb-0 ${bg}`}>
      <Navbar totalReports={0} onMenuClick={() => {}} sidebarDisabled mapView="profesionales" />
      {showModal && (
        <PostularModal
          vacante={vacante}
          isDark={isDark}
          onClose={() => setShowModal(false)}
          onSent={(id) => { setSentConvId(id); setShowModal(false); }}
        />
      )}

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.push("/profesionales")}
          className={`flex items-center gap-2 mb-6 text-sm ${textSec} hover:text-blue-400 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al buscador
        </button>

        {/* Header card */}
        <div className={`rounded-2xl border p-6 mb-4 ${cardBg}`}>
          {/* Empresa */}
          <Link href={`/comercio/${vacante.comercio.slug}`} className="flex items-center gap-3 mb-5 group">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow">
              {vacante.comercio.foto
                ? <img src={vacante.comercio.foto} alt={vacante.comercio.nombre} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900 text-xl font-bold text-white">
                    {vacante.comercio.nombre[0].toUpperCase()}
                  </div>
              }
            </div>
            <div>
              <p className={`font-semibold text-sm group-hover:text-blue-400 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>
                {vacante.comercio.nombre}
              </p>
              <p className={`text-xs ${textSec}`}>{vacante.comercio.rubro}</p>
            </div>
            <svg className={`w-4 h-4 ml-auto flex-shrink-0 ${textSec}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Titulo */}
          <h1 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            {vacante.titulo}
          </h1>

          {/* Meta info */}
          {metaItems.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-5">
              {metaItems.map(({ icon: Icon, label }, i) => (
                <div key={i} className={`flex items-center gap-1.5 text-sm ${textSec}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Descripcion */}
          <p className={`text-sm leading-relaxed mb-5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {vacante.descripcion}
          </p>

          {/* Habilidades buscadas */}
          {vacante.habilidades.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${textSec}`}>Que buscamos</p>
              <div className="flex flex-wrap gap-2">
                {vacante.habilidades.map((h) => (
                  <span key={h} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                    isDark ? "bg-blue-900/30 text-blue-300 border-blue-800" : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>{h}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exito */}
        {sentConvId && (
          <div className={`rounded-2xl border p-5 mb-4 ${isDark ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-green-400" : "text-green-600"}`} />
              <div>
                <p className={`font-semibold text-sm mb-1 ${isDark ? "text-green-300" : "text-green-800"}`}>Postulacion enviada</p>
                <p className={`text-xs ${isDark ? "text-green-400" : "text-green-700"}`}>
                  {vacante.comercio.nombre} recibio tu mensaje. Si no responden en 24 horas, podras contactarlos por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {!sentConvId && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-colors shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Postularme
            </button>
          )}
          {vacante.comercio.whatsapp && sentConvId && (
            <a
              href={`https://wa.me/549${vacante.comercio.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola! Vi la vacante de ${vacante.titulo} en Reportes Reconquista y me gustaría postularme.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-colors ${isDark ? "bg-gray-800 text-green-400 hover:bg-gray-700 border border-gray-700" : "bg-white text-green-700 hover:bg-gray-50 border border-gray-200 shadow-sm"}`}
            >
              <Phone className="w-5 h-5" />
              Contactar por WhatsApp
            </a>
          )}
          <div className="flex justify-center">
            <ShareButton
              url={`/vacante/${vacante.id}`}
              title={vacante.titulo}
              text={`Vacante: ${vacante.titulo} en ${vacante.comercio.nombre} - Reconquista`}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
