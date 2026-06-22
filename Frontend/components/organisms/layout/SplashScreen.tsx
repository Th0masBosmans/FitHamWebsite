"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem("splashShown");

    if (splashShown) {
      setShouldRender(false);
      return;
    }

    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splashShown", "true");
      setTimeout(() => setShouldRender(false), 500);
    }, 2000);

    return () => clearTimeout(timer);
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
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1], // Bounce effect
        }}
        className="relative"
      >
        <img
          src="/FitHamLogo.png"
          alt="FIT HAM Logo"
          className="w-64 h-auto object-contain"
        />

        {/* Pulsing Glow Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[var(--color-accent)] blur-3xl -z-10 rounded-full"
        />
      </motion.div>

      {/* Loading Dots */}
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
