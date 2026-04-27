"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("rr-splash");
    if (!shown) {
      setVisible(true);
      sessionStorage.setItem("rr-splash", "1");
      const t = setTimeout(() => setVisible(false), 2400);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 70% 45% at 80% 0%,   rgba(251,146,60,0.22) 0%, transparent 65%),
              radial-gradient(ellipse 70% 45% at 20% 100%, rgba(251,146,60,0.14) 0%, transparent 65%),
              linear-gradient(180deg, #3b5fc0 0%, #1e3a8a 45%, #172554 100%)
            `,
          }}
        >
          {/* Logo: empieza pequeño y borroso, crece y se enfoca */}
          <motion.img
            src="/icon-192x192.png"
            alt="Reportes Reconquista"
            initial={{ scale: 0.12, filter: "blur(14px)", opacity: 0.5 }}
            animate={{ scale: 1,    filter: "blur(0px)",  opacity: 1   }}
            transition={{
              scale:   { duration: 0.85, ease: [0.34, 1.2, 0.64, 1] },
              filter:  { duration: 0.7,  ease: "easeOut" },
              opacity: { duration: 0.4,  ease: "easeOut" },
            }}
            className="w-28 h-28 rounded-[28%]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
