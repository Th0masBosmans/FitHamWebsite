"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pause, Play } from "lucide-react";
import { PageHeading } from "@/components/molecules/PageHeading";

export type HeroSlide = {
  url: string;
  caption: string;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Stores calculated smart crop position for each image url
  const [smartPositions, setSmartPositions] = useState<Record<string, string>>({});

  const allMedia = slides;

  // 1. Smart Content-Aware Analyzer
  useEffect(() => {
    allMedia.forEach((media) => {
      if (smartPositions[media.url]) return; // Already analyzed

      const img = new Image();
      img.crossOrigin = "anonymous"; // Prevents CORS issues with external storage
      img.src = media.url;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Downscale to 50x50 for lightning-fast computational performance
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        try {
          const imageData = ctx.getImageData(0, 0, 50, 50).data;
          const rowDetails = new Array(50).fill(0);

          // Measure vertical contrast variance (detecting edge details/people vs flat sky/ground)
          for (let y = 1; y < 49; y++) {
            for (let x = 0; x < 50; x++) {
              const currentIdx = (y * 50 + x) * 4;
              const aboveIdx = ((y - 1) * 50 + x) * 4;

              const currentBr = (imageData[currentIdx] + imageData[currentIdx + 1] + imageData[currentIdx + 2]) / 3;
              const aboveBr = (imageData[aboveIdx] + imageData[aboveIdx + 1] + imageData[aboveIdx + 2]) / 3;

              rowDetails[y] += Math.abs(currentBr - aboveBr);
            }
          }

          // Find the horizontal band containing the highest concentration of details
          let maxScore = 0;
          let focalRow = 25; // Default center fallback
          const windowSize = 6; // Scan window height

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

          // Convert focal point to a clean CSS percentage
          const focalPercentage = Math.round((focalRow / 50) * 100);
          
          setSmartPositions((prev) => ({
            ...prev,
            [media.url]: `center ${focalPercentage}%`,
          }));
        } catch (e) {
          // Fallback if image domain security (CORS) blocks canvas reading
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

          // Retrieve calculated position or fall back to center while loading
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

      {/* Overlays */}
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