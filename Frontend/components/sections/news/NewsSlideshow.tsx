"use client";

import { useEffect, useState } from "react";
import { NewsCard } from "./NewsCard";
import type { NewsArticle } from "@/repository/newsRepository";

// Hoe lang één bericht blijft staan voor het volgende komt.
const SLIDE_MS = 6000;

/**
 * De uitgelichte berichten in één grote kaart. Is er maar één, dan is het
 * gewoon die kaart. Zijn het er meer, dan wisselen ze elkaar vanzelf af, met
 * bolletjes eronder om er zelf een te kiezen. Met de muis erop staat de
 * diavoorstelling stil, zodat je rustig kan lezen.
 *
 * Alle kaarten liggen op dezelfde plek in één raster: zo is de hoogte altijd die
 * van de hoogste, en springt de pagina niet bij het wisselen.
 *
 * Wordt gebruikt op de homepagina (home/NewsSection) en bovenaan /nieuws.
 */
export function NewsSlideshow({ articles }: { articles: NewsArticle[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Komt er een bericht minder, dan niet blijven hangen op een lege plek.
  const active = articles.length ? current % articles.length : 0;

  useEffect(() => {
    if (articles.length < 2 || paused) return;
    const timer = setInterval(() => setCurrent((index) => (index + 1) % articles.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [articles.length, paused]);

  if (articles.length === 0) return null;
  if (articles.length === 1) return <NewsCard article={articles[0]} featured />;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="grid">
        {articles.map((article, index) => (
          <div
            key={article.id}
            aria-hidden={index !== active}
            className={`col-start-1 row-start-1 transition-opacity duration-700 ease-out ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <NewsCard article={article} featured />
          </div>
        ))}
      </div>

      {/* Bolletjes om zelf een bericht te kiezen; het actieve is een streepje */}
      <div className="mt-4 flex justify-center gap-2">
        {articles.map((article, index) => (
          <button
            key={article.id}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Toon ${article.title}`}
            aria-current={index === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === active ? "w-6 bg-[var(--color-accent)]" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
