"use client";

import { Facebook, Instagram } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/molecules/SectionHeading";

const socialLinkClasses =
  "aspect-square lg:aspect-auto lg:h-48 flex flex-col items-center justify-center gap-2 bg-white/90 rounded-2xl hover:bg-white hover:scale-105 transition-all border-2 border-white/50 shadow-xl";
const socialLabelClasses = "body-small text-[var(--color-primary-brand)] font-bold";
const socialIconClasses = "w-10 h-10 lg:w-12 lg:h-12 text-[var(--color-primary-brand)]";

export function SocialMediaSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-6 lg:mb-16"
    >
      <SectionHeading title="Volg Ons" />
      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        <motion.a
          href="https://www.facebook.com/profile.php?id=100063627339831"
          target="_blank"
          rel="noopener noreferrer"
          className={socialLinkClasses}
          whileHover={{ rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Facebook className={socialIconClasses} />
          <span className={socialLabelClasses}>
            Facebook
          </span>
        </motion.a>

        <motion.a
          href="https://www.instagram.com/vcfitham/"
          target="_blank"
          rel="noopener noreferrer"
          className={socialLinkClasses}
          whileTap={{ scale: 0.95 }}
        >
          <Instagram className={socialIconClasses} />
          <span className={socialLabelClasses}>
            Instagram
          </span>
        </motion.a>

        <motion.a
          href="https://www.tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={socialLinkClasses}
          whileHover={{ rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className={socialIconClasses}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
          <span className={socialLabelClasses}>
            TikTok
          </span>
        </motion.a>
      </div>
    </motion.div>
  );
}
