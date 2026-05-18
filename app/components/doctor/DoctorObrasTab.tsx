import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import type { Doctor } from "../../types";
import { OBRAS_SOCIALES } from "../../utils/doctorHelpers";

interface Props {
  doctor: Doctor;
  confirming: string | null;
  loadingConfirm: boolean;
  onConfirmar: (obraSocial: string, acepta: boolean) => void;
  onSetConfirming: (os: string | null) => void;
  getStatus: (os: string) => "acepta" | "rechaza" | "desconocido";
}

export function DoctorObrasTab({ doctor, confirming, loadingConfirm, onConfirmar, onSetConfirming, getStatus }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Confirmado por la comunidad. Ayudá actualizando la info.</p>
      {OBRAS_SOCIALES.map((os) => {
        const status = getStatus(os);
        return (
          <div key={os} className={`flex items-center justify-between rounded-xl p-3 ${
            status === "acepta" ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" :
            status === "rechaza" ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" :
            "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-2">
              {status === "acepta" && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
              {status === "rechaza" && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              {status === "desconocido" && <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{os}</p>
                  {os === "IAPOS" && doctor.iapos && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">Padrón oficial</span>
                  )}
                </div>
                <p className={`text-xs ${status === "acepta" ? "text-green-600 dark:text-green-400" : status === "rechaza" ? "text-red-500 dark:text-red-400" : "text-gray-400"}`}>
                  {status === "acepta" ? "Acepta" : status === "rechaza" ? "No acepta" : "Sin información"}
                </p>
              </div>
            </div>
            {confirming === os ? (
              <div className="flex gap-1">
                <button disabled={loadingConfirm} onClick={() => onConfirmar(os, true)}
                  className="px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg font-semibold disabled:opacity-50">Sí</button>
                <button disabled={loadingConfirm} onClick={() => onConfirmar(os, false)}
                  className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg font-semibold disabled:opacity-50">No</button>
                <button disabled={loadingConfirm} onClick={() => onSetConfirming(null)}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg font-semibold">✕</button>
              </div>
            ) : (
              <button onClick={() => onSetConfirming(os)} className="text-xs text-blue-500 hover:underline">
                ¿Sigue así?
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
