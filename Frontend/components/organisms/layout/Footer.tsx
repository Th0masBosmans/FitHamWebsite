"use client";

import { useEffect, useState } from "react";
import { MapPin, Lock } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { SponsorRepository } from "@/repository/sponsorRepository";
import { Sponsor } from "@/types";
import { useIsDesktop } from "@/lib/useIsDesktop";

const sponsorRepository = new SponsorRepository();

export function Footer() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    sponsorRepository.fetchSponsors().then(setSponsors);
  }, []);

  useEffect(() => {
    if (sponsors.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [sponsors.length]);

  const getPrevIndex = (index: number) => (index - 1 + sponsors.length) % sponsors.length;
  const getNextIndex = (index: number) => (index + 1) % sponsors.length;
  const getFarPrevIndex = (index: number) => (index - 2 + sponsors.length) % sponsors.length;
  const getFarNextIndex = (index: number) => (index + 2) % sponsors.length;

  const handleMapClick = () => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=Sporthal+t'Vlietje+sportlaan+10a+3945+Ham",
      "_blank"
    );
  };

  const getVariantsMobile = (position: string) => {
    // Mobile: 1 big center + 2 small sides
    switch (position) {
      case "center":
        return { x: "0%", scale: 1, opacity: 1, zIndex: 10 };
      case "prev":
        return { x: "-80%", scale: 0.8, opacity: 0.6, zIndex: 5 };
      case "next":
        return { x: "80%", scale: 0.8, opacity: 0.6, zIndex: 5 };
      default:
        return { x: "0%", scale: 0.5, opacity: 0, zIndex: 0 };
    }
  };

  const getVariantsDesktop = (position: string) => {
    // Desktop: 3 big center + 2 small sides with small gaps between the 3 big ones
    switch (position) {
      case "center":
        return { x: "0%", scale: 1, opacity: 1, zIndex: 10 };
      case "prev":
        return { x: "-102%", scale: 1, opacity: 1, zIndex: 9 };
      case "next":
        return { x: "102%", scale: 1, opacity: 1, zIndex: 9 };
      case "far-prev":
        return { x: "-184%", scale: 0.8, opacity: 0.6, zIndex: 5 };
      case "far-next":
        return { x: "184%", scale: 0.8, opacity: 0.6, zIndex: 5 };
      default:
        return { x: "0%", scale: 0.5, opacity: 0, zIndex: 0 };
    }
  };

  return (
    <footer className="mt-8 bg-(--color-primary-brand)/95 backdrop-blur-md border-t-4 border-(--color-accent)">
      <div className="max-w-md lg:max-w-6xl mx-auto px-6 py-6">
        {/* Sponsors Section */}
        <div className="mb-8">
          <div className="mb-6 text-center">
            <h3 className="text-white label-base font-bold">
              Onze Sponsors
            </h3>
          </div>

          {/* 3-card push carousel - mobile: 1 big + 2 small, desktop: 3 big + 2 small */}
          <Link
            href="/sponsors"
            className="relative h-28 lg:h-40 flex items-center justify-center overflow-hidden cursor-pointer group"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-xl"></div>
            <div className="relative w-full h-full max-w-70 lg:max-w-225">
              {sponsors.map((sponsor, index) => {
                let positionMobile = "hidden";
                let positionDesktop = "hidden";

                // Mobile: 3 sponsors (1 center + 2 sides)
                if (index === currentIndex) positionMobile = "center";
                else if (index === getPrevIndex(currentIndex)) positionMobile = "prev";
                else if (index === getNextIndex(currentIndex)) positionMobile = "next";

                // Desktop: 5 sponsors (3 center + 2 sides)
                if (index === currentIndex) positionDesktop = "center";
                else if (index === getPrevIndex(currentIndex)) positionDesktop = "prev";
                else if (index === getNextIndex(currentIndex)) positionDesktop = "next";
                else if (index === getFarPrevIndex(currentIndex)) positionDesktop = "far-prev";
                else if (index === getFarNextIndex(currentIndex)) positionDesktop = "far-next";

                return (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={
                      isDesktop
                        ? getVariantsDesktop(positionDesktop)
                        : getVariantsMobile(positionMobile)
                    }
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 left-0 right-0 m-auto w-[65%] lg:w-[28%] h-24 lg:h-32 rounded-xl overflow-hidden shadow-xl bg-white pointer-events-none"
                  >
                    <img
                      src={sponsorRepository.getSponsorImageUrl(sponsor.image)}
                      alt={sponsor.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                );
              })}
            </div>
          </Link>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-4">
            {sponsors.map((_sponsor, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentIndex === index ? "bg-white w-4" : "bg-white/40"
                }`}
                aria-label={`Go to sponsor ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Info with Address */}
        <div className="text-center pt-6 border-t border-white/20">
          <button
            onClick={handleMapClick}
            className="inline-flex items-center gap-3 text-white/90 hover:text-white transition-colors group mx-auto bg-white/10 px-5 py-3 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
              <span className="absolute inset-0 bg-white/20 rounded-full animate-ping"></span>
              <span className="absolute inset-1 bg-[var(--color-accent)]/40 rounded-full animate-pulse"></span>
              <div className="relative z-10 w-8 h-8 bg-[var(--color-accent)] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-[var(--color-primary-brand)] drop-shadow-sm" />
              </div>
            </div>
            <span className="label-regular text-left sm:text-center sm:whitespace-nowrap font-semibold">
              <span className="block sm:inline">Sporthal t&apos;Vlietje</span>
              <span className="hidden sm:inline"> - </span>
              <span className="block sm:inline">Sportlaan 10a, 3945 Ham</span>
            </span>
          </button>
          <div className="flex items-center justify-center gap-2 mt-6">
            <p className="text-white/50 label-small">
              © 2026 FIT HAM. Alle rechten voorbehouden.
            </p>
            <Link
              href="/admin/login"
              className="text-white/30 hover:text-white/80 transition-colors"
            >
              <Lock className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
