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
      const t = setTimeout(() => setVisible(false), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "#2563eb" }}
        >
          <motion.img
            src="/icon-192x192.png"
            alt="Reportes Reconquista"
            initial={{ scale: 0.82, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-28 h-28 rounded-[28%]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
