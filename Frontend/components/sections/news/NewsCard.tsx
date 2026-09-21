"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { NewsRepository, articleDate, type NewsArticle } from "@/repository/newsRepository";
import { formatEventDay, formatEventMonthShort } from "@/lib/eventFormat";

const newsRepository = new NewsRepository();

/**
 * Het kaartje van een nieuwsbericht: dezelfde vorm als een evenementkaart, maar
 * het klikt door naar de eigen pagina van het bericht in plaats van een venster
 * te openen.
 *
 * De foto vult de kaart; er staat standaard alleen het gele datumblokje en de
 * titel op. De inleiding schuift op een breed scherm pas omhoog als je met de
 * muis over de kaart gaat. Op een gsm blijven de inleiding en de ondertitel weg
 * en staan er enkel de titel en de knop "Lees meer".
 *
 * Wordt gebruikt op de homepagina (het nieuwsblok) en op /nieuws.
 */
export function NewsCard({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  const reduceMotion = useReducedMotion();

  // De klassen voluit, niet samengesteld: anders vindt Tailwind ze niet terug.
  // Even hoog als de evenementkaarten: groot = het uitgelichte evenement,
  // klein = een kaartje uit de tijdlijn. Op een gsm is een evenementkaart zo hoog
  // als de staande affiche; hier volgt de kaart dezelfde staande verhouding.
  const heightClass = featured
    ? "aspect-3/4 sm:aspect-auto sm:h-[28rem] lg:h-[32rem]"
    : "aspect-3/4 sm:aspect-auto sm:h-[26rem]";
  const titleClass = featured ? "title-section" : "label-xl font-black uppercase tracking-tight";
  const paddingClass = featured ? "p-5 lg:p-7" : "p-5";

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={`/nieuws/${article.slug}`}
        className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-white/15 bg-[var(--color-primary-brand-darker)] shadow-2xl transition-shadow hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] ${heightClass}`}
      >
        {/* De hoofdfoto. Is er nog geen, dan blijft er een gekleurd vlak staan
            met een klein icoontje, zodat de kaart niet leeg oogt. */}
        {article.image ? (
          <img
            src={newsRepository.getImageUrl(article.image)}
            alt={article.title}
            className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-secondary-brand)]/40 via-[var(--color-primary-brand)] to-[var(--color-primary-brand-darker)]">
            <Newspaper className="h-16 w-16 text-white/20" />
          </div>
        )}

        {/* Donker verloop onderaan, zodat de tekst leesbaar blijft */}
        <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/95 via-[var(--color-primary-brand-darker)]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Het gele datumblokje links en het label rechts: de vaste herkenningspunten */}
        <div className="absolute left-4 top-4 z-10 rounded-xl bg-[var(--color-accent)] px-2.5 py-1.5 text-center text-[var(--color-primary-brand)] shadow-lg">
          <div className="text-2xl font-black leading-none">{formatEventDay(articleDate(article).date)}</div>
          <div className="text-[0.7rem] font-extrabold uppercase leading-tight tracking-[0.15em]">
            {formatEventMonthShort(articleDate(article).date)}
          </div>
        </div>
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white shadow-lg backdrop-blur-md label-small font-extrabold uppercase tracking-wide">
          <Newspaper className="h-3.5 w-3.5" />
          Nieuws
        </span>

        <div className={`relative z-10 flex flex-col gap-3 ${paddingClass}`}>
          <h3 className={`text-white drop-shadow-lg ${titleClass}`}>{article.title}</h3>
          {article.subtitle && <p className="hidden text-[var(--color-accent)] label-regular font-bold sm:block">{article.subtitle}</p>}

          {/* De inleiding schuift op een breed scherm omhoog bij hover. Op een
              gsm blijft ze weg (net als de ondertitel): daar staan enkel de titel en de
              knop, want elke tik is er meteen een klik naar de pagina. */}
          <div className="hidden grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out sm:grid sm:group-hover:grid-rows-[1fr]">
            <div className="min-h-0 overflow-hidden">
              <p className="line-clamp-3 max-w-2xl text-white/85 body-small leading-relaxed lg:body-regular">
                {article.intro}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-[var(--color-primary-brand)] shadow-lg label-small font-extrabold uppercase tracking-wide transition-transform group-hover:scale-105">
            Lees meer
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
