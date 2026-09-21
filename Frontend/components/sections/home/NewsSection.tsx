"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/sections/news/NewsCard";
import { NewsRepository, type NewsArticle } from "@/repository/newsRepository";

const newsRepository = new NewsRepository();

/**
 * Het nieuwsblok op de homepagina: dezelfde plek en dezelfde rol als het
 * uitgelichte evenement, maar dan voor berichten met een eigen pagina.
 *
 * Toont de berichten die de beheerder uitgelicht heeft. Is er precies één, dan
 * krijgt die de volle breedte; zijn het er meer, dan komen ze naast elkaar.
 * Is er niets uitgelicht, dan toont dit blok niets.
 */
export function NewsSection() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    newsRepository.fetchArticles().then((all) => setArticles(all.filter((article) => article.highlighted)));
  }, []);

  if (articles.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-8 lg:py-16">
      <div className="mx-auto max-w-md px-6 lg:max-w-6xl">
        <SectionHeading title="Nieuws" />

        <div className={articles.length === 1 ? "" : "grid grid-cols-1 gap-6 sm:grid-cols-2"}>
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} featured={articles.length === 1} />
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Link
            href="/nieuws"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white shadow-sm backdrop-blur-md label-small font-extrabold uppercase tracking-wide transition-all hover:scale-105 hover:bg-white/30 active:scale-95"
          >
            Alle nieuws
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
