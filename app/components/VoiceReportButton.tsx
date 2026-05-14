"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2, CheckCircle } from "lucide-react";

interface VoiceReportButtonProps {
  onReportCreated: (report: any) => void;
}

const RECONQUISTA_CENTER = { lat: -29.15, lng: -59.65 };
const MAX_RECORDING_SEC = 30;
import { API_URL } from "../lib/api/client";

type State = "idle" | "listening" | "processing" | "success" | "error";

export default function VoiceReportButton({ onReportCreated }: VoiceReportButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [feedback, setFeedback] = useState("");
  const [showToast, setShowToast] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const streamRef        = useRef<MediaStream | null>(null);
  const autoStopRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = (msg: string, autoHide = false) => {
    setFeedback(msg);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (autoHide) {
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setState("idle");
        setFeedback("");
      }, 5000);
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

  const stopAndSend = () => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.stop(); // dispara ondataavailable + onstop
  };

  const startRecording = async () => {
    // Pedir permiso de micrófono — muestra el diálogo del sistema
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("error");
      showFeedback(
        "Micrófono bloqueado. Abrí el browser → Configuración → Configuración de sitios → Micrófono → permitir este sitio.",
        true
      );
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    // Elegir el mime type más compatible
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
      ? "audio/ogg;codecs=opus"
      : "";

    const mr = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = async () => {
      // Liberar micrófono
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      if (chunksRef.current.length === 0) {
        setState("error");
        showFeedback("No se grabó audio. Intentá de nuevo.", true);
        return;
      }

      setState("processing");
      showFeedback("Procesando...");

      const audioBlob = new Blob(chunksRef.current, {
        type: mr.mimeType || "audio/webm",
      });

      if (audioBlob.size < 1000) {
        setState("error");
        showFeedback("Grabación muy corta. Hablá un poco más.", true);
        return;
      }

      const position = await getPosition();
      const form = new FormData();
      form.append("audio", audioBlob, "audio.webm");
      form.append("lat", String(position.lat));
      form.append("lng", String(position.lng));

      try {
        const res = await fetch(`${API_URL}/api/voice/report`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) {
          setState("error");
          showFeedback(data.error || "No se pudo procesar el audio.", true);
          return;
        }
        setState("success");
        showFeedback(`Reporte creado: "${data.report?.descripcion || "listo"}"`, true);
        onReportCreated(data.report);
      } catch {
        setState("error");
        showFeedback("Error de conexión. Intentá de nuevo.", true);
      }
    };

    mr.start(250); // chunk cada 250ms
    mediaRecorderRef.current = mr;
    setState("listening");
    showFeedback(`Grabando... tocá para enviar (máx ${MAX_RECORDING_SEC}s)`);

    // Auto-stop después de MAX_RECORDING_SEC segundos
    autoStopRef.current = setTimeout(stopAndSend, MAX_RECORDING_SEC * 1000);
  };

  const handleTap = () => {
    if (state === "idle" || state === "error") {
      startRecording();
    } else if (state === "listening") {
      stopAndSend();
    }
  };

  const isListening  = state === "listening";
  const isProcessing = state === "processing";
  const isSuccess    = state === "success";
  const isError      = state === "error";

  return (
    <div className="fixed bottom-[9rem] right-4 flex flex-col items-end gap-2" style={{ zIndex: 950 }}>
      {showToast && feedback && (
        <div className={`
          max-w-[240px] px-3 py-2 rounded-xl text-xs font-medium shadow-lg
          ${isSuccess    ? "bg-green-600 text-white" : ""}
          ${isError      ? "bg-red-600 text-white" : ""}
          ${isListening  ? "bg-gray-900 text-white" : ""}
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
          ${isListening  ? "bg-red-500 scale-110 ring-4 ring-red-300" : ""}
          ${isProcessing ? "bg-blue-500 cursor-not-allowed" : ""}
          ${isSuccess    ? "bg-green-500" : ""}
          ${isError      ? "bg-red-400" : ""}
          ${state === "idle" ? "bg-purple-600 active:scale-110 active:bg-purple-700" : ""}
        `}
      >
        {isProcessing && <Loader2 className="w-4 h-4 text-white animate-spin" />}
        {isListening  && <Square className="w-5 h-5 text-white" />}
        {isSuccess    && <CheckCircle className="w-4 h-4 text-white" />}
        {(state === "idle" || isError) && <Mic className="w-4 h-4 text-white" />}
      </button>
    </div>
  );
}
