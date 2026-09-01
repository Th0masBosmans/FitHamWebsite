"use client";

import { useState } from "react";
import { motion } from "motion/react";

const FALLBACK_HERO = "/assets/hero-spirit.png";

//Hangt af van foto tot foto manueel hier aanpassen indien nodig
const CROP_TOP = 0.21;
const CROP_BOTTOM = 0.21;

export function HomeHero({ heroImageUrl }: { heroImageUrl?: string | null }) {
  const heroSrc = heroImageUrl ?? FALLBACK_HERO;
  const [ratio, setRatio] = useState<number | null>(null);

  const measure = (img: HTMLImageElement | null) => {
    if (img?.naturalWidth && img.naturalHeight) {
      setRatio(img.naturalWidth / (img.naturalHeight * (1 - CROP_TOP - CROP_BOTTOM)));
    }
  };

  return (
    <div
      className="relative mb-6 overflow-hidden"
      style={{
        aspectRatio: ratio ?? undefined,
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
          ref={measure}
          onLoad={(event) => measure(event.currentTarget)}
          src={heroSrc}
          alt="Fit Ham Spirit"
          className={ratio ? "w-full h-full object-cover" : "w-full h-auto"}
          style={{ objectPosition: `center ${(CROP_TOP / (CROP_TOP + CROP_BOTTOM)) * 100}%` }}
        />
      </motion.div>
    </div>
  );
}
