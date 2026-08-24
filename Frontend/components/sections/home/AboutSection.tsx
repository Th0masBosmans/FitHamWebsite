"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHeading } from "@/components/ui/PageHeading";

export function AboutSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mb-8 lg:mb-16"
    >
      <SectionHeading title="Onze missie & visie"></SectionHeading>
      <motion.div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-150">
        <div className="max-w-3xl mx-auto text-left">
          <h3
            className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section text-center"
            style={{ fontWeight: "var(--font-weight-extrabold)" }}
          >
            Welkom bij FIT Ham!
          </h3>
          <p
            className="text-[var(--color-primary-brand)] leading-relaxed mb-4 lg:mb-6 body-large font-medium"
          >
            Bij FIT Ham zijn we meer dan een volleybalclub. We zijn een warme club waar{" "}
            <strong className="font-bold">sport, plezier en verbondenheid</strong> centraal staan.
          </p>
          <p
            className="text-[var(--color-primary-brand)] leading-relaxed mb-4 lg:mb-6 body-large font-medium"
          >
            Iedereen krijgt de kans om te groeien op zijn of haar eigen tempo. We geloven in{" "}
            <strong className="font-bold">teamgeest, respect, engagement</strong> en een gezonde mix
            van ambitie en spelplezier.
          </p>
          <p
            className="text-[var(--color-primary-brand)] leading-relaxed mb-4 lg:mb-6 body-large font-medium"
          >
            Spelers, trainers, ouders, supporters en vrijwilligers vormen samen één team.
          </p>
          <p
            className="text-[var(--color-primary-brand)] leading-relaxed body-large font-bold"
          >
            FIT Ham is een plek waar iedereen welkom is, zich thuis voelt en samen sterker wordt.
            Samen spelen. Samen groeien. Samen FIT Ham.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
