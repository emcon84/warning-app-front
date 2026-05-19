"use client";

import { useState, useEffect } from "react";

interface Props {
  fecha: string;
  texto: string | null | undefined;
}

function calcDiff(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSecs = Math.floor(diff / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;
  return { days, hours, mins, secs, totalSecs };
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

export function EventoCountdown({ fecha, texto }: Props) {
  const target = new Date(fecha);
  const msToEvent = target.getTime() - Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const [diff, setDiff] = useState(() => calcDiff(target));

  useEffect(() => {
    if (msToEvent > sevenDays || msToEvent <= 0) return;
    const id = setInterval(() => setDiff(calcDiff(target)), 1000);
    return () => clearInterval(id);
  }, [fecha]);

  if (msToEvent > sevenDays || msToEvent <= 0 || !diff) return null;

  const label = texto?.trim() || "Ya falta poco!";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[2px]">
      <p className="text-white/90 text-sm font-bold uppercase tracking-widest mb-3 drop-shadow">
        {label}
      </p>

      {diff.days > 0 ? (
        <div className="flex items-end gap-3">
          <CountBox value={diff.days}  label="días"   big />
          <CountBox value={diff.hours} label="horas"  big />
          <CountBox value={diff.mins}  label="min"    big />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-white font-black tabular-nums drop-shadow"
            style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", lineHeight: 1 }}>
            {pad(diff.hours)}:{pad(diff.mins)}:{pad(diff.secs)}
          </span>
        </div>
      )}
    </div>
  );
}

function CountBox({ value, label, big }: { value: number; label: string; big?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-white font-black tabular-nums drop-shadow"
        style={{ fontSize: big ? "clamp(2.5rem, 10vw, 5rem)" : "2rem", lineHeight: 1 }}
      >
        {value}
      </span>
      <span className="text-white/70 text-xs font-semibold mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}
