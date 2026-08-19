"use client";

import { Facebook, Instagram } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
          href="https://twizzit.com/fitham"
          target="_blank"
          rel="noopener noreferrer"
          className={socialLinkClasses}
          whileHover={{ rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Het Twizzit-icoontje is een witte PNG: via een mask kleuren we het in het merkblauw */}
          <span
            aria-hidden
            className={socialIconClasses}
            style={{
              backgroundColor: "var(--color-primary-brand)",
              maskImage: "url(/twizziticon.png)",
              WebkitMaskImage: "url(/twizziticon.png)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskPosition: "center",
              WebkitMaskPosition: "center",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
          <span className={socialLabelClasses}>
            Twizzit
          </span>
        </motion.a>
      </div>
    </motion.div>
  );
}
