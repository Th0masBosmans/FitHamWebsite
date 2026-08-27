"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { AccentBar } from "@/components/ui/AccentBar";
import { SectionHeading } from "@/components/ui/SectionHeading";

// De twee kortingen die de club aanbiedt. Dit is vaste tekst, dus hij staat hier
// en niet in de database, net zoals de andere uitlegblokken op deze pagina.
const DISCOUNTS = [
  {
    title: "Gezinskorting",
    text: "Vanaf 2 leden uit hetzelfde gezin geniet je van een korting op het lidgeld.",
  },
  {
    title: "UiTPAS",
    text: "Fit Ham werkt samen met de UiTPAS van Tessenderlo-Ham. Beschik je over een UiTPAS? Bezorg ons de 13-cijferige code van je UiTPAS.",
  },
];

/**
 * Het openingsblok van de lidgeldpagina. Alles zit in één witte kaart, in
 * dezelfde stijl als het missie-en-visieblok op de homepagina: de belofte
 * bovenaan, de twee kortingen als tegels eronder en de contactknop als voet.
 */
export function MembershipDiscounts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // De gekleurde vlekken schuiven trager mee dan de kaart, wat diepte geeft.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-14%", "14%"]);
  const glowYReverse = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["12%", "-12%"]);

  return (
    <div ref={sectionRef} className="relative isolate">
      {/* Wazige vlekken achter de kaart, zoals bij het uitgelichte evenement. Cyaan
          op de cyaanblauwe achtergrond viel weg, vandaar wit en geel. */}
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="pointer-events-none absolute -left-28 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl lg:h-[26rem] lg:w-[26rem]"
      />
      <motion.div
        aria-hidden
        style={{ y: glowYReverse }}
        className="pointer-events-none absolute -right-28 -bottom-16 h-64 w-64 rounded-full bg-[var(--color-accent)]/20 blur-3xl lg:h-80 lg:w-80"
      />

      <div className="relative">
        <SectionHeading title="Lidgeld" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl border-2 border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-md lg:p-10"
        >
          {/* De opening van de kaart: grote titel met rustige uitleg eronder */}
          <div className="max-w-2xl">
            <h3 className="text-[var(--color-primary-brand)] title-page text-balance">
              Toegankelijkheid voor iedereen
            </h3>
            <p className="mt-3 text-[var(--color-primary-brand)]/70 body-large font-medium leading-relaxed lg:mt-4">
              Bij Fit Ham vinden we het belangrijk dat volleybal toegankelijk is voor iedereen.
            </p>
          </div>

          {/* De kortingen als tegels binnen dezelfde kaart */}
          <div className="mt-6 grid gap-3 lg:mt-8 lg:grid-cols-2 lg:gap-4">
            {DISCOUNTS.map(({ title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.1, ease: "easeOut" }}
                className="group flex h-full flex-col rounded-2xl bg-[var(--color-primary-brand)]/5 p-5 transition-colors duration-300 hover:bg-[var(--color-primary-brand)]/10 lg:p-6"
              >
                <div className="flex items-center gap-3">
                  <AccentBar className="h-6 w-1.5 flex-shrink-0" />
                  <h4 className="text-[var(--color-primary-brand)] title-section leading-tight">
                    {title}
                  </h4>
                </div>

                <p className="mt-3 text-[var(--color-primary-brand)]/70 body-regular font-medium leading-relaxed">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Voet van de kaart: vraag links, knop rechts */}
          <div className="mt-6 flex flex-col gap-3 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <p className="text-[var(--color-primary-brand)]/70 body-regular font-medium leading-relaxed">
              Heb je vragen over het lidgeld of de kortingen? Neem contact met ons op!
            </p>
            <Link
              href="/contact#contact-form"
              className="group inline-flex w-fit flex-shrink-0 items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-[var(--color-primary-brand)] label-regular font-bold shadow-md shadow-yellow-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-accent-border)] hover:shadow-lg"
            >
              Neem contact op
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
