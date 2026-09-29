"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Hourglass } from "lucide-react";
import { motion } from "motion/react";
import { PageHeading } from "@/components/ui/PageHeading";
import { findClubTopic } from "@/components/sections/onze-club/clubTopics";

type ClubTopicContentProps = {
  /** De slug uit clubTopics; bepaalt de titel en de ondertitel van de pagina. */
  slug: string;
  /** De inhoud van de pagina. Zonder inhoud verschijnt een "binnenkort"-melding. */
  children?: ReactNode;
}

/**
 * Het casco van een onderwerp onder "Onze Club": terugknop, titel en een kaart
 * met de inhoud. Zolang een pagina nog geen inhoud meegeeft, toont de kaart een
 * "binnenkort"-melding.
 */
export function ClubTopicContent({ slug, children }: ClubTopicContentProps) {
  const router = useRouter();
  const topic = findClubTopic(slug);

  if (!topic) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md lg:max-w-4xl mx-auto px-6 py-8"
    >
      {/* Terugknop naar de homepagina; "Onze Club" is enkel een menu, geen pagina. */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 inline-flex items-center gap-2 text-white hover:text-(--color-accent) transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20 font-bold"
      >
        <ArrowLeft className="w-5 h-5" />
        Terug
      </button>

      {/* Titel van de pagina */}
      <PageHeading title={topic.label} subtitle={topic.description} />

      {/* De inhoud brengt zijn eigen (witte) kaarten mee; zonder inhoud tonen we
          een tijdelijke melding. */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {children ?? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm lg:p-12">
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-accent) text-(--color-primary-brand) shadow-lg">
              <Hourglass className="h-8 w-8" strokeWidth={2.5} />
            </span>

            <h2 className="text-white title-section mb-3">Binnenkort beschikbaar</h2>
            <p className="mx-auto max-w-prose text-white/80 body-regular">
              We zijn deze pagina volop aan het samenstellen. Kom snel nog eens terug.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
