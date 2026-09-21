"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Newspaper } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AccentBar } from "@/components/ui/AccentBar";
import { NewsBlockSection } from "@/components/sections/news/NewsBlocks";
import { EventRegistrationButton } from "@/components/sections/events/EventRegistrationButton";
import { NewsRepository, articleDate, type NewsArticle } from "@/repository/newsRepository";
import { formatEventDate } from "@/lib/eventFormat";

const newsRepository = new NewsRepository();

/**
 * De eigen pagina van één nieuwsbericht, bv. /nieuws/smash-squad.
 *
 * Bovenaan de kop: de titel met het gele balkje, de ondertitel,
 * de inleiding en de actieknop, met de hoofdfoto ernaast. Die foto staat vast:
 * laat je ze meebewegen, dan schuift ze over het eerste blok eronder.
 * Daaronder de blokken die de beheerder samenstelde
 * (zie sections/news/NewsBlocks).
 */
export function NewsArticleContent({ article }: { article: NewsArticle }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden pb-16 lg:pb-24"
    >
      {/* Wazige gekleurde vlekken op de achtergrond, achter de inhoud. Op een
          vaste afstand van boven, niet in procent: anders schuiven ze mee als
          de pagina langer wordt (een vraag die openklapt). */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-24 h-80 w-80 rounded-full bg-[var(--color-secondary-brand)]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[40rem] -left-32 h-96 w-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-md px-6 pt-6 sm:max-w-2xl lg:max-w-5xl">
        <Link
          href="/nieuws"
          className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md label-small font-bold uppercase tracking-wide transition-colors hover:bg-white/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle nieuws
        </Link>

        {/* De kop van de pagina: tekst links, foto rechts. Op een gsm komt de
            foto onder de tekst te staan. */}
        <section className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mb-2 flex items-center gap-3">
              <AccentBar className="h-12 w-2" />
              <h1 className="text-white title-page">{article.title}</h1>
            </div>

            {article.subtitle && (
              <p className="pl-5 text-[var(--color-accent)] label-large font-bold">{article.subtitle}</p>
            )}

            <p className="mt-5 max-w-xl text-white/90 body-regular leading-relaxed lg:body-large">{article.intro}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {article.cta_url && <EventRegistrationButton url={article.cta_url} label={article.cta_label} />}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-white shadow-lg backdrop-blur-md label-small font-extrabold uppercase tracking-wide transition-all hover:scale-105 hover:bg-white/30 active:scale-95"
              >
                <Mail className="h-4 w-4" />
                Stel je vraag
              </Link>
            </div>

            <p className="mt-6 text-white/60 label-small font-semibold">
              {articleDate(article).edited ? "Bijgewerkt op" : "Gepubliceerd op"} {formatEventDate(articleDate(article).date)}
            </p>
          </motion.div>

          {/* De hoofdfoto. Ontbreekt ze, dan blijft er een gekleurd vlak staan. */}
          <motion.div
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[var(--color-accent)]/15 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-[var(--color-primary-brand-darker)] shadow-2xl">
              {article.image ? (
                <img
                  src={newsRepository.getImageUrl(article.image)}
                  alt={article.title}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="flex aspect-4/3 items-center justify-center bg-gradient-to-br from-[var(--color-secondary-brand)]/40 via-[var(--color-primary-brand)] to-[var(--color-primary-brand-darker)]">
                  <Newspaper className="h-20 w-20 text-white/20" />
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* De blokken die de beheerder samenstelde, met wat extra ruimte erboven */}
        <div className="mt-8 lg:mt-16">
          {article.blocks.map((block, index) => (
            <NewsBlockSection key={index} block={block} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
