"use client";

import { motion } from "motion/react";

const FALLBACK_HERO = "/assets/hero-spirit.png";

export function HomeHero({ heroImageUrl }: { heroImageUrl?: string | null }) {
  const heroSrc = heroImageUrl ?? FALLBACK_HERO;

  return (
    <div
      className="relative mb-6 overflow-hidden h-96"
      style={{
        maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full h-full"
      >
        <img
          src={heroSrc}
          alt="FIT HAM Spirit"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
