"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pause, Play } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";

export type HeroSlide = {
  url: string;
  caption: string;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Onthoudt per foto op welke hoogte we ze best bijsnijden.
  const [smartPositions, setSmartPositions] = useState<Record<string, string>>({});

  const allMedia = slides;

  // Zoekt uit waar het "interessante" deel van een foto zit, zodat een staande
  // foto in de brede banner niet toevallig op de lucht of de vloer uitkomt.
  useEffect(() => {
    allMedia.forEach((media) => {
      if (smartPositions[media.url]) return; // Deze foto is al bekeken

      const img = new Image();
      img.crossOrigin = "anonymous"; // Nodig om een foto van Supabase te mogen uitlezen
      img.src = media.url;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Eerst verkleinen naar 50x50: rekenen op een minifoto gaat razendsnel.
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        try {
          const imageData = ctx.getImageData(0, 0, 50, 50).data;
          const rowDetails = new Array(50).fill(0);

          // Meet hoeveel er per rij verandert: veel verschil = mensen of details,
          // weinig verschil = egale lucht of vloer.
          for (let y = 1; y < 49; y++) {
            for (let x = 0; x < 50; x++) {
              const currentIdx = (y * 50 + x) * 4;
              const aboveIdx = ((y - 1) * 50 + x) * 4;

              const currentBr = (imageData[currentIdx] + imageData[currentIdx + 1] + imageData[currentIdx + 2]) / 3;
              const aboveBr = (imageData[aboveIdx] + imageData[aboveIdx + 1] + imageData[aboveIdx + 2]) / 3;

              rowDetails[y] += Math.abs(currentBr - aboveBr);
            }
          }

          // Zoek de horizontale strook met de meeste details.
          let maxScore = 0;
          let focalRow = 25; // Vinden we niets bijzonders, dan het midden
          const windowSize = 6; // Hoe hoog de strook is die we bekijken

          for (let y = windowSize; y < 50 - windowSize; y++) {
            let currentWindowScore = 0;
            for (let w = -windowSize; w <= windowSize; w++) {
              currentWindowScore += rowDetails[y + w];
            }
            if (currentWindowScore > maxScore) {
              maxScore = currentWindowScore;
              focalRow = y;
            }
          }

          // Omzetten naar een percentage dat we aan de foto kunnen meegeven.
          const focalPercentage = Math.round((focalRow / 50) * 100);
          
          setSmartPositions((prev) => ({
            ...prev,
            [media.url]: `center ${focalPercentage}%`,
          }));
        } catch (e) {
          // Lukt het uitlezen niet, dan gewoon het midden nemen.
          setSmartPositions((prev) => ({ ...prev, [media.url]: "center center" }));
        }
      };
    });
  }, [allMedia, smartPositions]);

  useEffect(() => {
    setCurrentSlideIndex((prev) => (allMedia.length === 0 ? 0 : prev % allMedia.length));
  }, [allMedia.length]);

  useEffect(() => {
    if (isPaused || allMedia.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % allMedia.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, allMedia.length]);

  return (
    <div
      className="relative mb-6 overflow-hidden h-96 w-full bg-gradient-to-br from-[var(--color-primary-brand-darker)] via-[var(--color-primary-brand)] to-[var(--color-primary-brand-dark)]"
      style={{
        maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        {allMedia.map((media, index) => {
          if (index !== currentSlideIndex) return null;

          // De berekende hoogte, of het midden zolang de berekening loopt.
          const currentObjectPosition = smartPositions[media.url] || "center center";

          return (
            <motion.div
              key={index}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.8 }}
              className="absolute inset-0 overflow-hidden w-full h-full"
            >
              <motion.img
                src={media.url}
                alt={media.caption}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: currentObjectPosition }}
                initial={{ scale: 1 }}
                animate={{ scale: 1.06 }}
                transition={{ duration: 4, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Donkere lagen over de foto, voor leesbare tekst */}
      <div className="absolute top-8 inset-x-0 z-20 pointer-events-none">
        <div className="max-w-md lg:max-w-7xl mx-auto px-6 flex items-start justify-between">
          <PageHeading title="Foto's" subtitle="Herbeleef onze mooiste momenten!" />
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}