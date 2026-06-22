"use client";

import { motion } from "motion/react";
import { HomeHero } from "@/components/organisms/home/HomeHero";
import { AboutSection } from "@/components/organisms/home/AboutSection";
import { WebshopSection } from "@/components/organisms/home/WebshopSection";
import { SocialMediaSection } from "@/components/organisms/home/SocialMediaSection";

export function HomeContent({ heroImageUrl }: { heroImageUrl?: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-8"
    >
      {/* Hero Image - Full Width */}
      <HomeHero heroImageUrl={heroImageUrl} />

      <div className="max-w-md lg:max-w-6xl mx-auto px-6">
        <AboutSection />
        <WebshopSection />
        <SocialMediaSection />
      </div>
    </motion.div>
  );
}
