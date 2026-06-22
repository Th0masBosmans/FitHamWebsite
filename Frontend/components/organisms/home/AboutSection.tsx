"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { PageHeading } from "@/components/molecules/PageHeading";

export function AboutSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mb-8 lg:mb-16"
    >
      <SectionHeading title="Over ons"></SectionHeading>
      <motion.div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-150 text-center">
        <h3
          className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section"
          style={{ fontWeight: "var(--font-weight-extrabold)" }}
        >
          Welkom bij Fit Ham!
        </h3>
        <p
          className="text-[var(--color-primary-brand)] leading-relaxed mb-4 lg:mb-6 body-large max-w-3xl mx-auto font-medium"
        >
          Van je eerste serve tot spannende competitiewedstrijden. Fit Ham biedt teams voor alle
          leeftijden en niveaus. Onze ervaren trainers & coaches zorgen voor een leerrijke en uitdagende omgeving
          waar iedereen zich kan ontwikkelen en plezier beleven.
        </p>
        <p
          className="text-[var(--color-primary-brand)] leading-relaxed body-large max-w-3xl mx-auto font-medium"
        >
          Dit kunnen we alleen doen dankzij onze geweldige{" "}
          <Link
            href="/sponsors"
            className="text-[var(--color-secondary-brand)] hover:text-[var(--color-accent)] underline decoration-2 underline-offset-2 transition-colors font-bold"
          >
            sponsoren
          </Link>{" "}
          die ons steunen. Bekijk wie er achter ons staan!
        </p>
      </motion.div>
    </motion.div>
  );
}
