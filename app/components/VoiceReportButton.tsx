"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2, CheckCircle } from "lucide-react";

interface VoiceReportButtonProps {
  onReportCreated: (report: any) => void;
}

const RECONQUISTA_CENTER = { lat: -29.15, lng: -59.65 };

type State = "idle" | "listening" | "processing" | "success" | "error";

const CATEGORY_LABELS: Record<string, string> = {
  basura: "Falta de recolección de basura",
  alumbrado: "Falta de alumbrado público",
  baches: "Baches en vía pública",
  pastizales: "Falta de limpieza de pastizales",
  robo: "Robo",
  personas_sospechosas: "Personas sospechosas",
  fugas_agua: "Fugas de agua",
  drenaje: "Problemas de alcantarillado/drenaje",
  banquetas: "Banquetas dañadas/obstruidas",
  semaforos: "Semáforos descompuestos",
  limpieza: "Falta de limpieza en áreas públicas",
  graffiti: "Vandalismo/grafiti",
  escombros: "Escombros o residuos voluminosos",
  arboles: "Árboles caídos/peligrosos",
  vandalismo: "Daños a propiedad pública",
  vehiculos_abandonados: "Vehículos abandonados",
  iluminacion: "Falta de iluminación",
  animales_callejeros: "Animales callejeros",
  plagas: "Plagas urbanas",
  senalizacion: "Señalización dañada",
  estacionamiento: "Problemas de estacionamiento",
  transporte: "Problemas de transporte público",
};

export default function VoiceReportButton({ onReportCreated }: VoiceReportButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [feedback, setFeedback] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = (msg: string, autoHide = false) => {
    setFeedback(msg);
    setShowToast(true);
    if (autoHide) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setState("idle");
        setFeedback("");
      }, 4000);
    }
  };

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setState("processing");
    showFeedback("Transcribiendo audio...");

    // Obtener GPS o centro de Reconquista
    let position = RECONQUISTA_CENTER;
    try {
      const geoPos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
      );
      position = { lat: geoPos.coords.latitude, lng: geoPos.coords.longitude };
    } catch {}

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("lat", String(position.lat));
      formData.append("lng", String(position.lng));

      const res = await fetch(`${apiBase}/api/voice/report`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        showFeedback(data.error || "No se pudo crear el reporte", true);
        return;
      }

      setState("success");
      const label = CATEGORY_LABELS[data.report.category] || data.report.category;
      const r = data.report;

      if (data.extracted?.enviar_servicios) {
        const msg = `🏛️ *RECLAMO DE SERVICIOS PÚBLICOS*\n\n📋 *Tipo:* ${label}\n📝 *Descripción:* ${r.description}\n📍 *Barrio:* ${r.barrio}\n📍 *Dirección:* ${r.direccion}\n🗺️ https://www.google.com/maps?q=${r.lat},${r.lng}\n📅 ${new Date().toLocaleDateString("es-AR")}\n🌐 reportesreconquista.com`;
        window.open(`https://wa.me/5493482519279?text=${encodeURIComponent(msg)}`, "_blank");
        showFeedback(`✓ Reporte creado y enviado a Servicios Públicos`, true);
      } else {
        showFeedback(`✓ ${label} en ${r.direccion}`, true);
      }

      onReportCreated(r);
    } catch {
      setState("error");
      showFeedback("Error de conexión. Intentá de nuevo.", true);
    }
  }, [onReportCreated]);

  const startRecording = async () => {
    if (state !== "idle" && state !== "error") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        processAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setState("listening");
      showFeedback("Grabando... soltá para enviar");
    } catch {
      setState("error");
      showFeedback("No se pudo acceder al micrófono.", true);
    }
  };

  const stopRecording = () => {
    if (state !== "listening") return;
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setState("processing");
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <div className="fixed bottom-44 right-4 flex flex-col items-end gap-2" style={{ zIndex: 1000 }}>
      {/* Toast */}
      {showToast && feedback && (
        <div className={`
          max-w-xs px-3 py-2 rounded-xl text-xs font-medium shadow-lg animate-slide-up
          ${isSuccess ? "bg-green-600 text-white" : ""}
          ${isError ? "bg-red-600 text-white" : ""}
          ${isListening ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : ""}
          ${isProcessing ? "bg-blue-600 text-white" : ""}
        `}>
          {feedback}
        </div>
      )}

      {/* Botón — mantené apretado para grabar */}
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        disabled={isProcessing}
        title="Mantené apretado para grabar"
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all select-none
          ${isListening ? "bg-red-500 scale-110 ring-4 ring-red-300" : ""}
          ${isProcessing ? "bg-blue-500 cursor-not-allowed" : ""}
          ${isSuccess ? "bg-green-500" : ""}
          ${isError ? "bg-red-400" : ""}
          ${state === "idle" ? "bg-purple-600 active:scale-110 active:bg-purple-700" : ""}
        `}
      >
        {isProcessing && <Loader2 className="w-5 h-5 text-white animate-spin" />}
        {isListening && <Mic className="w-6 h-6 text-white animate-pulse" />}
        {isSuccess && <CheckCircle className="w-5 h-5 text-white" />}
        {(state === "idle" || isError) && <Mic className="w-5 h-5 text-white" />}
      </button>
    </div>
  );
}
