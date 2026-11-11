import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { NewsArticleContent } from "@/components/pages/public/NewsArticleContent";
import { NewsRepository, type NewsArticle } from "@/repository/newsRepository";

const newsRepository = new NewsRepository();

// Het bericht wordt op de server opgehaald, niet in de browser. Zo staan de titel,
// de beschrijving en de foto al in de HTML. WhatsApp, Facebook en co. voeren geen
// JavaScript uit; zonder dit toonde een gedeelde link enkel "Fit Ham".
export const getServerSideProps: GetServerSideProps<{ article: NewsArticle | null }> = async ({ params, res }) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const article = slug ? await newsRepository.fetchArticleBySlug(slug) : null;

  if (!article) res.statusCode = 404;
  // Vercel mag de pagina even bewaren, zodat niet elk bezoek de database aanspreekt.
  else res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  return { props: { article } };
};

export default function NewsArticlePage({ article }: { article: NewsArticle | null }) {
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

  const title = `${article.title} | Fit Ham`;
  const description = article.intro.slice(0, 160);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta key="description" name="description" content={description} />
        {/* Het voorbeeldkaartje als iemand de link deelt */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Fit Ham" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={description} />
        {article.image && <meta property="og:image" content={newsRepository.getImageUrl(article.image)} />}
        <meta name="twitter:card" content={article.image ? "summary_large_image" : "summary"} />
      </Head>
      <NewsArticleContent article={article} />
    </>
  );
}
