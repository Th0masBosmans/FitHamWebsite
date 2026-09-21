import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { NewsArticleContent } from "@/components/pages/public/NewsArticleContent";
import { NewsRepository, type NewsArticle } from "@/repository/newsRepository";

const newsRepository = new NewsRepository();

export default function NewsArticlePage() {
  const router = useRouter();
  const { slug } = router.query;
  const key = Array.isArray(slug) ? slug[0] : slug;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Bij de allereerste weergave kent Next.js het adres uit de URL nog niet.
    if (!key) return;
    setLoaded(false);
    newsRepository
      .fetchArticleBySlug(key)
      .then(setArticle)
      .finally(() => setLoaded(true));
  }, [key]);

  if (!key || !loaded) return null;

  if (!article) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center sm:max-w-2xl">
        <h1 className="text-white title-page">Niet gevonden</h1>
        <p className="mt-3 text-white/85 body-regular">Dit nieuwsbericht bestaat niet (meer).</p>
        <Link
          href="/nieuws"
          className="mt-6 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-[var(--color-primary-brand)] label-small font-extrabold uppercase tracking-wide shadow-lg transition-transform hover:scale-105"
        >
          Al het nieuws
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${article.title} | Fit Ham`}</title>
        <meta name="description" content={article.intro.slice(0, 160)} />
      </Head>
      <NewsArticleContent article={article} />
    </>
  );
}
