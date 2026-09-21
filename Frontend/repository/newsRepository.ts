import { supabase } from "@/supabase";
import { NewsArticle, NewsBlock } from "@/types";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { NewsArticle, NewsBlock };

const COLUMNS = "id, slug, title, subtitle, intro, image, blocks, highlighted, published_at, updated_at, cta_url, cta_label";

// Nieuwsberichten. Werkt hetzelfde als eventRepository: de tekst gaat naar de
// tabel `news_articles` in Supabase, de foto's naar Cloudinary en in de database
// staat alleen het "public id" ervan.
//
// Het verschil is `blocks`: dat is JSON, geen kolom per veld. Een nieuw soort
// blok vraagt dus geen wijziging aan de database.

// De hoofdfoto en de foto's in een fotoblok worden groot getoond, dus laten we
// ze ruimer door dan de affiche van een evenement (die is 300 KB).
const IMAGE_MAX_KB = 3000;

/** De velden die opgeslagen worden. `id` en de twee datums niet: die zet de
 *  database zelf bij het aanmaken, en `updated_at` zetten we hier bij elke
 *  wijziging. Zo klopt de datum op de site altijd met wat er echt gebeurd is. */
type ArticleFields = Omit<NewsArticle, "id" | "published_at" | "updated_at">;

class NewsRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchArticles(): Promise<NewsArticle[]> {
    const { data, error } = await supabase
      .from("news_articles")
      .select(COLUMNS)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch news articles:", error.message);
      return [];
    }

    return (data ?? []) as NewsArticle[];
  }

  /** Eén bericht ophalen aan de hand van zijn webadres. Null als het niet bestaat. */
  async fetchArticleBySlug(slug: string): Promise<NewsArticle | null> {
    const { data, error } = await supabase.from("news_articles").select(COLUMNS).eq("slug", slug).maybeSingle();

    if (error) {
      console.error("Failed to fetch news article:", error.message);
      return null;
    }

    return (data as NewsArticle | null) ?? null;
  }

  async postArticle(fields: ArticleFields): Promise<NewsArticle> {
    const { data, error } = await supabase.from("news_articles").insert(this.toRow(fields)).select(COLUMNS).single();

    if (error || !data) {
      if (error) throw new Error(this.describe(error));
      throw new Error("Kon het nieuwsbericht niet toevoegen, probeer opnieuw.");
    }

    return data as NewsArticle;
  }

  async updateArticle(id: number, fields: ArticleFields): Promise<NewsArticle> {
    const { data, error } = await supabase
      .from("news_articles")
      .update({ ...this.toRow(fields), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (error) throw new Error(this.describe(error));
      throw new Error("Kon het nieuwsbericht niet bijwerken, probeer opnieuw.");
    }

    return data as NewsArticle;
  }

  async deleteArticle(article: NewsArticle): Promise<void> {
    const { error } = await supabase.from("news_articles").delete().eq("id", article.id!);
    if (error) throw error;

    // Pas na het verwijderen de foto's opruimen: de hoofdfoto én alles wat er in
    // de fotoblokken zat, anders blijven die voorgoed in Cloudinary staan.
    const leftovers = [article.image, ...collectBlockImages(article.blocks)].filter(Boolean) as string[];
    await Promise.all(
      leftovers.map((publicId) =>
        this.deleteImage(publicId).catch((error) => console.error("Cloudinary cleanup failed:", error))
      )
    );
  }

  async uploadImage(file: File): Promise<string> {
    return this.cloudinary.uploadToCloudinary(file, IMAGE_MAX_KB);
  }

  async deleteImage(publicId: string): Promise<void> {
    return this.cloudinary.deleteFromCloudinary(publicId);
  }

  getImageUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }

  private toRow(fields: ArticleFields) {
    return {
      slug: fields.slug,
      title: fields.title,
      subtitle: fields.subtitle,
      intro: fields.intro,
      image: fields.image,
      blocks: fields.blocks,
      highlighted: fields.highlighted,
      cta_url: fields.cta_url,
      cta_label: fields.cta_label,
    };
  }

  /** Twee berichten met hetzelfde webadres kan niet; dat in mensentaal zeggen. */
  private describe(error: { code?: string; message: string }): string {
    if (error.code === "23505") return "Er bestaat al een nieuwsbericht met dit webadres. Kies een ander.";
    return error.message;
  }
}

/**
 * De datum die bij een bericht hoort: wanneer het gepubliceerd is, of wanneer
 * het daarna nog gewijzigd is. Een minuut speling, want bij het aanmaken
 * verschillen de twee tijdstempels een fractie.
 */
export function articleDate(article: NewsArticle): { date: string; edited: boolean } {
  const edited = new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 60_000;
  return { date: edited ? article.updated_at : article.published_at, edited };
}

/** Alle Cloudinary-foto's die in de blokken van een bericht zitten. */
export function collectBlockImages(blocks: NewsBlock[]): string[] {
  return blocks.flatMap((block) => (block.type === "photos" ? block.images : []));
}

/**
 * Maakt van een titel een webadres: kleine letters, streepjes in plaats van
 * spaties, en accenten eraf. "Smash Squad" wordt zo "smash-squad".
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export { NewsRepository };
