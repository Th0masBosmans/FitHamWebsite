"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { DiscountCode } from "./DiscountCode";

export function WebshopSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-8 lg:mb-16"
    >
      <SectionHeading title="Webshop" />
      <motion.div className="block bg-gradient-to-br from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] rounded-2xl p-6 lg:px-10 lg:py-3 shadow-2xl border-2 border-[var(--color-secondary-brand)]/50 relative overflow-hidden group text-center">
        <div className="absolute -right-10 -top-10 w-40 h-40 lg:w-56 lg:h-56 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 lg:w-48 lg:h-48 bg-[var(--color-accent)]/10 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <h3
            className="text-white mb-3 lg:mb-4 heading-display text-3xl lg:text-4xl font-extrabold"
          >
            Fit Ham merchandise
          </h3>
          <p
            className="text-white/90 body-regular leading-relaxed mb-4 max-w-[280px] lg:max-w-full font-medium"
          >
            Van sokken tot hele outfits - laat je omtoveren in onze club kleuren.
          </p>

          <div className="mb-4 lg:-mt-6 lg:-mb-8 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
            {/* Left side - Shirt and Shorts */}
            <div className="hidden lg:flex items-center justify-center w-60 h-60">
              <div className="scale-[1.15]">
                <motion.div
                  className="relative w-52 h-52"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="/Webshop/merch-shirt.png"
                    alt="FIT HAM Shirt"
                    className="absolute top-0 left-0 w-44 h-44 object-contain drop-shadow-2xl"
                    style={{ rotate: "-10deg", zIndex: 1 }}
                  />
                  <img
                    src="/Webshop/merch-shorts.png"
                    alt="FIT HAM Shorts"
                    className="absolute bottom-0 right-0 w-36 h-36 object-contain drop-shadow-2xl"
                    style={{ rotate: "12deg", zIndex: 2 }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Center - Discount Code */}
            <div className="flex flex-col items-center gap-4">
              <DiscountCode />
            </div>

            {/* Right side - Bag and Socks */}
            <div className="hidden lg:flex items-center justify-center w-60 h-60">
              <div className="scale-[1.15]">
                <motion.div
                  className="relative w-52 h-52"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src="/Webshop/merch-bag.png"
                    alt="FIT HAM Rugzak"
                    className="absolute top-0 left-0 w-48 h-48 object-contain drop-shadow-2xl"
                    style={{ rotate: "8deg", zIndex: 1 }}
                  />
                  <img
                    src="/Webshop/merch-socks.png"
                    alt="FIT HAM Sokken"
                    className="absolute bottom-2 right-1 w-32 h-32 object-contain drop-shadow-2xl"
                    style={{ rotate: "-12deg", zIndex: 2 }}
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Shop Button */}
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-8 lg:px-10 py-3 lg:py-4 rounded-xl shadow-lg hover:bg-white hover:text-[var(--color-primary-brand)] transition-colors body-large cursor-pointer font-extrabold"
          >
            Shop Nu
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </a>
        </div>
        <p className="text-white body-small mb-1 mt-2 lg:mt-3">Gratis levering vanaf €50</p>
      </motion.div>
    </motion.div>
  );
}
