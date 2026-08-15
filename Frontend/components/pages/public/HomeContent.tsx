"use client";

import { motion } from "motion/react";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { FeaturedEventSection } from "@/components/sections/home/FeaturedEventSection";
import { AboutSection } from "@/components/sections/home/AboutSection";
import { WebshopSection } from "@/components/sections/home/WebshopSection";
import { SocialMediaSection } from "@/components/sections/home/SocialMediaSection";

export function HomeContent({ heroImageUrl }: { heroImageUrl?: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-8"
    >
      {/* Grote foto over de volle breedte (instelbaar in het beheerpaneel) */}
      <HomeHero heroImageUrl={heroImageUrl} />

      {/* Het uitgelichte evenement, dezelfde kaart als op de evenementenpagina */}
      <FeaturedEventSection />

      <div className="max-w-md lg:max-w-6xl mx-auto px-6">
        <AboutSection />
        <WebshopSection />
        <SocialMediaSection />
      </div>
    </motion.div>
  );
}
