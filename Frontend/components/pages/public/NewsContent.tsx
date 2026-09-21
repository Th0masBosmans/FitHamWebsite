"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHeading } from "@/components/ui/PageHeading";
import { NewsCard } from "@/components/sections/news/NewsCard";
import { NewsRepository, type NewsArticle } from "@/repository/newsRepository";

const newsRepository = new NewsRepository();

/**
 * De nieuwspagina: alle berichten, het recentste eerst. Het eerste bericht
 * krijgt de volle breedte, de rest staat in een raster van twee.
 */
export function NewsContent() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    newsRepository
      .fetchArticles()
      .then(setArticles)
      .finally(() => setLoaded(true));
  }, []);

  const [newest, ...rest] = articles;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden pb-16 lg:pb-24"
    >
      {/* Wazige gekleurde vlekken op de achtergrond, achter de inhoud */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 -right-24 h-72 w-72 rounded-full bg-[var(--color-secondary-brand)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-40 -left-28 h-80 w-80 rounded-full bg-[var(--color-accent)]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-md px-6 pt-6 sm:max-w-2xl lg:max-w-5xl">
        <PageHeading
          title="Nieuws"
          subtitle="Wat er leeft in de club, uitgebreid verteld."
          delay={0.1}
        />

        {loaded && articles.length === 0 && (
          <p className="rounded-2xl border-2 border-white/30 border-dashed bg-white/10 p-10 text-center text-white/80 body-regular font-semibold backdrop-blur-md">
            Er staat nog geen nieuws op de site.
          </p>
        )}

        {newest && (
          <div className="mb-6 lg:mb-8">
            <NewsCard article={newest} featured />
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {rest.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
