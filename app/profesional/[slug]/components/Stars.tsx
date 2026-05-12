"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

export const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export const SCORE_LABELS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];
export const SCORE_COLORS = ["", "text-red-500", "text-orange-400", "text-yellow-400", "text-green-400", "text-emerald-400"];

export function Stars({ score, size = "sm", dark = true }: { score: number; size?: "sm" | "md"; dark?: boolean }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${cls} ${i <= score ? "text-yellow-400" : dark ? "text-gray-700" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-3 justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="focus:outline-none transition-transform active:scale-90"
          style={{ transform: i <= active ? "scale(1.15)" : "scale(1)" }}
        >
          <svg
            className={`w-11 h-11 transition-all duration-150 ${i <= active ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" : "text-gray-400"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function fireConfetti(score: number) {
  if (score >= 4) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#FFD700", "#FFA500", "#10B981", "#3B82F6", "#F472B6"] });
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#FFD700", "#FFA500", "#10B981"] });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#FFD700", "#FFA500", "#10B981"] });
    }, 300);
  } else if (score <= 2) {
    confetti({ particleCount: 50, spread: 30, origin: { y: 0.2 }, colors: ["#6B7280", "#9CA3AF", "#60A5FA"], gravity: 0.5, ticks: 250, drift: 0 });
  }
}
