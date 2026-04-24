"use client";
import { useCallback } from "react";

export function useConfetti() {
  const fire = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;
    const end = Date.now() + 2000;
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);
  return { fire };
}
