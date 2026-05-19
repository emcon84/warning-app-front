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
  return { days, hours, mins, secs };
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

export function EventoCountdown({ fecha, texto }: Props) {
  const target     = new Date(fecha);
  const msToEvent  = target.getTime() - Date.now();
  const sevenDays  = 7 * 24 * 60 * 60 * 1000;

  const [diff, setDiff] = useState(() => calcDiff(target));

  useEffect(() => {
    if (msToEvent > sevenDays || msToEvent <= 0) return;
    const id = setInterval(() => setDiff(calcDiff(target)), 1000);
    return () => clearInterval(id);
  }, [fecha]);

  if (msToEvent > sevenDays || msToEvent <= 0 || !diff) return null;

  const label = texto?.trim() || "Ya falta poco!";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none pt-20 pb-8">
      <p className="text-white/90 text-sm font-bold uppercase tracking-widest mb-4 drop-shadow">
        {label}
      </p>

      <div className="flex items-center gap-1">
        {diff.days > 0 && (
          <>
            <CountBox value={diff.days}  label="días" />
            <Separator />
          </>
        )}
        <CountBox value={diff.hours} label="horas" />
        <Separator />
        <CountBox value={diff.mins}  label="min" />
        <Separator />
        <CountBox value={diff.secs}  label="seg" />
      </div>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="text-white/70 font-black self-start mt-2"
      style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1.2 }}
    >
      :
    </span>
  );
}

function CountBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[2.5rem]">
      <span
        className="text-white font-black tabular-nums drop-shadow"
        style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", lineHeight: 1 }}
      >
        {pad(value)}
      </span>
      <span className="text-white/60 text-xs font-semibold mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
