"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Doctor } from "../../types";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { MapPin, Phone, Stethoscope, MessageCircle, Navigation, CheckCircle, Loader } from "lucide-react";

const MiniMap = dynamic(() => import("./MiniMap"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  doctor: Doctor;
}

type GeoState = "idle" | "loading" | "success" | "error";

export default function MedicoClient({ doctor: initial }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [doctor, setDoctor] = useState(initial);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [geoError, setGeoError] = useState("");

  const bg          = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  const waText = encodeURIComponent("Hola, te contacto desde Reportes Reconquista");
  const waUrl  = doctor.whatsapp ? `https://wa.me/${doctor.whatsapp}?text=${waText}` : null;

  async function handleMarcarUbicacion() {
    if (!navigator.geolocation) {
      setGeoError("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setGeoState("loading");
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`${API}/api/doctors/${doctor.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });
          if (!res.ok) throw new Error();
          const updated: Doctor = await res.json();
          setDoctor(updated);
          setGeoState("success");
        } catch {
          setGeoState("error");
          setGeoError("No se pudo guardar la ubicación. Intentá de nuevo.");
        }
      },
      (err) => {
        setGeoState("error");
        setGeoError(
          err.code === 1
            ? "Permiso de ubicación denegado. Habilitalo en la configuración de tu dispositivo."
            : "No se pudo obtener tu ubicación. Intentá de nuevo."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled mapView="doctors" />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        {/* Volver */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-1.5 text-sm mb-5 transition-colors ${textSec} hover:${textPrimary}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Medicos
        </button>

        {/* Card principal */}
        <div className={`rounded-2xl border p-5 mb-4 ${cardBg}`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isDark ? "bg-blue-900/40 border border-blue-800" : "bg-blue-50 border border-blue-100"
            }`}>
              <Stethoscope className={`w-7 h-7 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            </div>
            <div>
              <h1 className={`text-xl font-black leading-tight ${textPrimary}`}>
                Dr/a. {doctor.nombre}
              </h1>
              <p className={`text-sm font-semibold mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                {doctor.especialidad}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {doctor.direccion && (
              <div className="flex items-center gap-2.5">
                <MapPin className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                <div>
                  <p className={`text-sm ${textPrimary}`}>{doctor.direccion}</p>
                  <p className={`text-xs ${textMuted}`}>{doctor.barrio}, Reconquista</p>
                </div>
              </div>
            )}
            {!doctor.direccion && doctor.barrio && (
              <div className="flex items-center gap-2.5">
                <MapPin className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                <p className={`text-sm ${textSec}`}>{doctor.barrio}, Reconquista</p>
              </div>
            )}
            {doctor.telefono && (
              <div className="flex items-center gap-2.5">
                <Phone className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                <p className={`text-sm ${textPrimary}`}>{doctor.telefono}</p>
              </div>
            )}
          </div>
        </div>

        {/* Obras sociales */}
        {(doctor.obrasSociales?.length > 0 || doctor.iapos) && (
          <div className={`rounded-2xl border p-5 mb-4 ${cardBg}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
              Obras sociales y prepagas
            </p>
            <div className="flex flex-wrap gap-2">
              {doctor.iapos && (
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                  isDark
                    ? "bg-green-900/40 text-green-400 border-green-800"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}>
                  IAPOS
                </span>
              )}
              {doctor.obrasSociales?.map((os) => (
                <span key={os} className={`text-xs px-3 py-1 rounded-full border font-medium ${
                  isDark
                    ? "bg-gray-800 text-gray-300 border-gray-700"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}>
                  {os}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sección mapa / ubicación */}
        <div className={`rounded-2xl border overflow-hidden mb-4 ${cardBg}`}>
          <div className="p-4 pb-3">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textMuted}`}>Ubicacion</p>
            {geoState === "success" && (
              <p className={`text-xs flex items-center gap-1.5 ${isDark ? "text-green-400" : "text-green-600"}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                Ubicacion guardada. Gracias por contribuir.
              </p>
            )}
          </div>

          {/* Mapa — solo si hay coordenadas */}
          {doctor.lat && doctor.lng ? (
            <div className="h-56">
              <MiniMap lat={doctor.lat} lng={doctor.lng} nombre={doctor.nombre} isDark={isDark} />
            </div>
          ) : (
            <div className={`mx-4 mb-3 py-8 rounded-xl flex flex-col items-center gap-2 ${
              isDark ? "bg-gray-800/60" : "bg-gray-50"
            }`}>
              <MapPin className={`w-8 h-8 ${textMuted}`} />
              <p className={`text-sm ${textSec}`}>Sin ubicacion registrada</p>
            </div>
          )}

          {/* Botón marcar ubicación */}
          <div className={`px-4 pb-4 ${doctor.lat && doctor.lng ? "pt-3 border-t " + (isDark ? "border-gray-800" : "border-gray-100") : ""}`}>
            {geoState === "success" ? null : (
              <button
                onClick={handleMarcarUbicacion}
                disabled={geoState === "loading"}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {geoState === "loading" ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Obteniendo ubicacion...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    {doctor.lat && doctor.lng ? "Corregir mi ubicacion" : "Estoy aqui — marcar ubicacion"}
                  </>
                )}
              </button>
            )}
            {geoError && (
              <p className="mt-2 text-xs text-red-500 text-center">{geoError}</p>
            )}
            {geoState !== "success" && (
              <p className={`mt-2 text-[11px] text-center ${textMuted}`}>
                {doctor.lat && doctor.lng
                  ? "Si la ubicacion es incorrecta, usa este boton desde el consultorio."
                  : "Usa este boton cuando estes fisicamente en el consultorio."}
              </p>
            )}
          </div>
        </div>

        {/* Botones contacto */}
        <div className="flex flex-col gap-2">
          {doctor.telefono && (
            <a
              href={`tel:${doctor.telefono}`}
              className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
                isDark
                  ? "bg-white text-gray-950 hover:bg-gray-100"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              <Phone className="w-4 h-4" />
              Llamar
            </a>
          )}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
