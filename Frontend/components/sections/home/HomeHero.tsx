"use client";

import { motion } from "motion/react";

const FALLBACK_HERO = "/assets/hero-spirit.png";

export function HomeHero({ heroImageUrl }: { heroImageUrl?: string | null }) {
  const heroSrc = heroImageUrl ?? FALLBACK_HERO;

  return (
    // Op een gsm groeit de balk mee met de foto zodat je ze volledig ziet;
    // vanaf tablet blijft het een vaste strook van 24rem.
    <div
      className="relative mb-6 overflow-hidden sm:h-96"
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
          alt="Fit Ham Spirit"
          className="w-full h-auto sm:h-full sm:object-cover"
        />
      </motion.div>
    </div>
  );
}
