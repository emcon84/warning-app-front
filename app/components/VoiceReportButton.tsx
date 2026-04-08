"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, CheckCircle, XCircle } from "lucide-react";

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
  const [transcript, setTranscript] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const recognitionRef = useRef<any>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = (msg: string, autoHide = false) => {
    setFeedback(msg);
    if (autoHide) {
      setShowToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setState("idle");
        setFeedback("");
        setTranscript("");
      }, 4000);
    }
  };

  const processTranscript = useCallback(async (text: string) => {
    setState("processing");
    setTranscript(text);
    showFeedback(`Procesando: "${text}"`);

    // Obtener posición GPS o usar centro de Reconquista como fallback
    let position = RECONQUISTA_CENTER;
    try {
      const geoPos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
      );
      position = { lat: geoPos.coords.latitude, lng: geoPos.coords.longitude };
    } catch {}

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiBase}/api/voice/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, lat: position.lat, lng: position.lng }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        showFeedback(data.error || "No se pudo crear el reporte", true);
        return;
      }

      setState("success");
      const label = CATEGORY_LABELS[data.report.category] || data.report.category;
      showFeedback(`✓ Reporte creado: ${label} en ${data.report.direccion}`, true);
      onReportCreated(data.report);
    } catch {
      setState("error");
      showFeedback("Error de conexión. Intentá de nuevo.", true);
    }
  }, [onReportCreated]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState("error");
      showFeedback("Tu browser no soporta reconocimiento de voz. Usá Chrome.", true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setState("listening");
      showFeedback("Escuchando... hablá ahora");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      recognition.stop();
      processTranscript(text);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        setState("error");
        showFeedback("No se detectó voz. Intentá de nuevo.", true);
      } else if (event.error === "not-allowed") {
        setState("error");
        showFeedback("Permiso de micrófono denegado.", true);
      } else {
        setState("error");
        showFeedback("Error al grabar. Intentá de nuevo.", true);
      }
    };

    recognition.onend = () => {
      if (state === "listening") {
        setState("idle");
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState("idle");
    setFeedback("");
  };

  const handleClick = () => {
    if (state === "listening") {
      stopListening();
    } else if (state === "idle" || state === "error") {
      startListening();
    }
  };

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <div className="fixed bottom-44 right-4 flex flex-col items-end gap-2" style={{ zIndex: 1000 }}>
      {/* Toast de feedback */}
      {feedback && (showToast || state === "listening" || state === "processing") && (
        <div className={`
          max-w-xs px-3 py-2 rounded-xl text-xs font-medium shadow-lg animate-slide-up
          ${isSuccess ? "bg-green-600 text-white" : ""}
          ${isError ? "bg-red-600 text-white" : ""}
          ${isListening ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" : ""}
          ${isProcessing ? "bg-blue-600 text-white" : ""}
        `}>
          {feedback}
        </div>
      )}

      {/* Botón micrófono */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        title="Crear reporte por voz"
        className={`
          w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all
          ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
          ${isProcessing ? "bg-blue-500 cursor-not-allowed" : ""}
          ${isSuccess ? "bg-green-500" : ""}
          ${isError ? "bg-red-400 hover:bg-red-500" : ""}
          ${state === "idle" ? "bg-purple-600 hover:bg-purple-700" : ""}
        `}
      >
        {isProcessing && <Loader2 className="w-5 h-5 text-white animate-spin" />}
        {isListening && <MicOff className="w-5 h-5 text-white" />}
        {isSuccess && <CheckCircle className="w-5 h-5 text-white" />}
        {(state === "idle" || isError) && <Mic className="w-5 h-5 text-white" />}
      </button>
    </div>
  );
}
