"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, CheckCircle } from "lucide-react";

interface VoiceReportButtonProps {
  onReportCreated: (report: any) => void;
}

const RECONQUISTA_CENTER = { lat: -29.15, lng: -59.65 };
type State = "idle" | "listening" | "processing" | "success" | "error";

export default function VoiceReportButton({ onReportCreated }: VoiceReportButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [feedback, setFeedback] = useState("");
  const [showToast, setShowToast] = useState(false);
  const recognitionRef = useRef<any>(null);
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

  const getPosition = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => resolve(RECONQUISTA_CENTER),
        { timeout: 4000 }
      );
    });

  const submitReport = async (text: string) => {
    if (!text.trim()) {
      setState("error");
      showFeedback("No se escuchó nada. Intentá de nuevo.", true);
      return;
    }

    setState("processing");
    showFeedback("Guardando reporte...");

    const position = await getPosition();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const res = await fetch(`${apiBase}/api/voice/simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text.trim(), lat: position.lat, lng: position.lng }),
      });

      const data = await res.json();
      if (!res.ok) {
        setState("error");
        showFeedback(data.error || "No se pudo guardar el reporte.", true);
        return;
      }

      setState("success");
      showFeedback(`Guardado: "${text.trim()}"`, true);
      onReportCreated(data.report);
    } catch {
      setState("error");
      showFeedback("Error de conexión. Intentá de nuevo.", true);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState("error");
      showFeedback("Tu navegador no soporta voz. Usá Chrome.", true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setState("listening");
      showFeedback("Escuchando... tocá para parar");
    };

    recognition.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript || "";
      submitReport(text);
    };

    recognition.onerror = (e: any) => {
      if (e.error === "no-speech") {
        setState("error");
        showFeedback("No se escuchó nada. Intentá de nuevo.", true);
      } else {
        setState("error");
        showFeedback("Error al escuchar. Intentá de nuevo.", true);
      }
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const handleTap = () => {
    if (state === "idle" || state === "error") {
      startListening();
    } else if (state === "listening") {
      stopListening();
    }
  };

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSuccess = state === "success";
  const isError = state === "error";

  return (
    <div className="fixed bottom-[9rem] right-4 flex flex-col items-end gap-2" style={{ zIndex: 950 }}>
      {showToast && feedback && (
        <div className={`
          max-w-[200px] px-3 py-2 rounded-xl text-xs font-medium shadow-lg
          ${isSuccess ? "bg-green-600 text-white" : ""}
          ${isError ? "bg-red-600 text-white" : ""}
          ${isListening ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : ""}
          ${isProcessing ? "bg-blue-600 text-white" : ""}
        `}>
          {feedback}
        </div>
      )}

      <button
        onClick={handleTap}
        disabled={isProcessing}
        title={isListening ? "Tocá para enviar" : "Reportar por voz"}
        className={`
          w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all select-none
          ${isListening ? "bg-red-500 scale-110 ring-4 ring-red-300" : ""}
          ${isProcessing ? "bg-blue-500 cursor-not-allowed" : ""}
          ${isSuccess ? "bg-green-500" : ""}
          ${isError ? "bg-red-400" : ""}
          ${state === "idle" ? "bg-purple-600 active:scale-110 active:bg-purple-700" : ""}
        `}
      >
        {isProcessing && <Loader2 className="w-4 h-4 text-white animate-spin" />}
        {isListening && <Square className="w-5 h-5 text-white" />}
        {isSuccess && <CheckCircle className="w-4 h-4 text-white" />}
        {(state === "idle" || isError) && <Mic className="w-4 h-4 text-white" />}
      </button>
    </div>
  );
}
