"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

const FADE_DURATION = 500;
// Noodrem: laat de bezoeker nooit vastzitten als er iets blijft hangen
const MAX_VISIBLE = 5000;

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let dismissed = false;

    // Verdwijnt zodra de pagina klaar is; geen minimale duur
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;

      setIsVisible(false);
      timers.push(setTimeout(() => setShouldRender(false), FADE_DURATION));
    };

    const windowLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true })
          );

    Promise.all([windowLoaded, document.fonts?.ready]).then(dismiss);
    timers.push(setTimeout(dismiss, MAX_VISIBLE));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (!shouldRender) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)]"
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      {/* Het logo dat inzoomt (public/FitHamLogo.png) */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1], // Verend effect
        }}
        className="relative"
      >
        <img
          src="/FitHamLogo.png"
          alt="Fit Ham"
          className="w-28 sm:w-36 h-auto object-contain"
        />
      </motion.div>

      {/* De drie stipjes onderaan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20 flex gap-2"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className="w-3 h-3 bg-white rounded-full"
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
