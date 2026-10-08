"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pause, Play } from "lucide-react";
import { PageHeading } from "@/components/ui/PageHeading";

export type HeroSlide = {
  url: string;
  caption: string;
}

// Wat we op pc van een foto onthouden om de beste uitsnede te kiezen.
type DetailProfile = {
  aspect: number; // hoogte gedeeld door breedte van de foto
  rows: number[]; // hoeveel detail (mensen) er per rij te zien is
};

const PROFILE_SIZE = 100; // De foto wordt geanalyseerd als 100x100 minifoto
const CLEAR_PART = 0.8; // Onderaan vervaagt de banner, alleen de bovenste 80% is echt goed zichtbaar
const HEAD_BAND = 12; // Zoveel rijen boven de uitsnede controleren we op afgesneden hoofden
const HEAD_PENALTY = 3; // Hoe zwaar het afsnijden van hoofden telt tegenover shirts en nummers

// Kiest op pc de hoogte waarop we een foto bijsnijden, als percentage voor object-position.
function desktopPosition(profile: DetailProfile, containerRatio: number) {
  const totalRows = profile.rows.length;
  // Welk deel van de fotohoogte past in de banner als de foto de volle breedte vult.
  const visibleRows = Math.round(Math.min(1, containerRatio / profile.aspect) * totalRows);
  if (visibleRows >= totalRows) return 50; // Past de hele foto, dan maakt de positie niet uit

  const clearRows = Math.max(1, Math.round(visibleRows * CLEAR_PART));
  let bestScore = -Infinity;
  let bestStart = 0;

  for (let start = 0; start + visibleRows <= totalRows; start++) {
    // Zoveel mogelijk detail in het goed zichtbare deel...
    let score = 0;
    for (let y = start; y < start + clearRows; y++) score += profile.rows[y];
    // ...maar straffen als we vlak erboven door drukke rijen snijden (hoofden).
    for (let y = Math.max(0, start - HEAD_BAND); y < start; y++) score -= profile.rows[y] * HEAD_PENALTY;

    if (score > bestScore) {
      bestScore = score;
      bestStart = start;
    }
  }

  // Omzetten naar object-position: 0% = bovenkant van de foto in beeld, 100% = onderkant.
  return (bestStart / (totalRows - visibleRows)) * 100;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Onthoudt per foto op welke hoogte we ze best bijsnijden (gsm).
  const [smartPositions, setSmartPositions] = useState<Record<string, number>>({});
  // Onthoudt per foto waar het detail zit, om op pc de uitsnede te berekenen.
  const [detailProfiles, setDetailProfiles] = useState<Record<string, DetailProfile>>({});
  // Op pc gebruiken we de nauwkeurigere berekening, op gsm blijft het zoals het was.
  const [isDesktop, setIsDesktop] = useState(false);
  // Verhouding hoogte/breedte van de banner, want die bepaalt hoeveel van de foto past.
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerRatio, setBannerRatio] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    const observer = new ResizeObserver(() => {
      if (banner.clientWidth > 0) setBannerRatio(banner.clientHeight / banner.clientWidth);
    });
    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  const allMedia = slides;

  // Zoekt uit waar het "interessante" deel van een foto zit, zodat een staande
  // foto in de brede banner niet toevallig op de lucht of de vloer uitkomt.
  useEffect(() => {
    allMedia.forEach((media) => {
      if (smartPositions[media.url] !== undefined) return; // Deze foto is al bekeken

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
            [media.url]: focalPercentage,
          }));

          // Voor pc: een fijnere analyse die ook randen in de breedte meetelt.
          // Het midden van de foto telt zwaarder, want daar staan meestal de spelers.
          const size = PROFILE_SIZE;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
          const pixels = ctx.getImageData(0, 0, size, size).data;
          const brightness = new Float32Array(size * size);
          for (let i = 0; i < size * size; i++) {
            brightness[i] = 0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2];
          }

          const rows = new Array(size).fill(0);
          for (let y = 1; y < size; y++) {
            for (let x = 1; x < size; x++) {
              const i = y * size + x;
              const edge = Math.abs(brightness[i] - brightness[i - 1]) + Math.abs(brightness[i] - brightness[i - size]);
              const centerWeight = 1 - (0.5 * Math.abs(x - size / 2)) / (size / 2);
              rows[y] += edge * centerWeight;
            }
          }

          // Een beetje uitsmeren, zodat één toevallige lijn (bv. een doellat) niet alles bepaalt.
          const smoothRows = rows.map((_, y) => {
            let sum = 0;
            let count = 0;
            for (let w = -2; w <= 2; w++) {
              if (rows[y + w] !== undefined) {
                sum += rows[y + w];
                count++;
              }
            }
            return sum / count;
          });

          setDetailProfiles((prev) => ({
            ...prev,
            [media.url]: { aspect: img.naturalHeight / img.naturalWidth, rows: smoothRows },
          }));
        } catch (e) {
          // Lukt het uitlezen niet, dan gewoon het midden nemen.
          setSmartPositions((prev) => ({ ...prev, [media.url]: 50 }));
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
      ref={bannerRef}
      className="relative mb-6 overflow-hidden h-96 lg:h-[min(70vh,40rem)] w-full bg-gradient-to-br from-[var(--color-primary-brand-darker)] via-[var(--color-primary-brand)] to-[var(--color-primary-brand-dark)]"
      style={{
        maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        {allMedia.map((media, index) => {
          if (index !== currentSlideIndex) return null;

          // De berekende hoogte, of het midden zolang de berekening loopt.
          // Op pc rekenen we de uitsnede uit met de echte maten van banner en foto.
          const focalPercentage = smartPositions[media.url] ?? 50;
          const profile = detailProfiles[media.url];
          const desktopPercentage = profile && bannerRatio > 0 ? desktopPosition(profile, bannerRatio) : 25;
          const currentObjectPosition = `center ${isDesktop ? desktopPercentage : focalPercentage}%`;

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
                style={{ objectPosition: currentObjectPosition, transformOrigin: isDesktop ? "top" : "center" }}
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