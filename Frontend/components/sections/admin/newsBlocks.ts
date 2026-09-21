import { FileText, HelpCircle, Images, LayoutGrid, MapPin, MousePointerClick } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NewsBlock, NewsBlockType, NewsButtonItem, NewsCardItem, NewsFaqItem, NewsLocationItem } from "@/types";

/**
 * De soorten blokken waaruit een beheerder een nieuwspagina samenstelt.
 *
 * Dit lijstje voedt de knoppenrij "blok toevoegen" in het beheerpaneel. Wil je
 * er een soort bij, dan zet je hem hier, geeft hem hieronder een lege vorm, en
 * tekent hem in sections/news/NewsBlocks — meer plekken zijn er niet.
 */
export const NEWS_BLOCK_TYPES: { type: NewsBlockType; label: string; icon: LucideIcon; hint: string }[] = [
  { type: "text", label: "Tekst", icon: FileText, hint: "Een tussentitel met lopende tekst eronder." },
  { type: "cards", label: "Kaarten", icon: LayoutGrid, hint: "Een rij kaartjes, bv. groepen of stappen." },
  { type: "faq", label: "Vragen", icon: HelpCircle, hint: "Vragen die open- en dichtklappen." },
  { type: "photos", label: "Foto's", icon: Images, hint: "Een fotoraster; foto's kan je hier uploaden." },
  { type: "buttons", label: "Knoppen", icon: MousePointerClick, hint: "Een rij actieknoppen met een eigen opschrift en link." },
  { type: "locations", label: "Locatie", icon: MapPin, hint: "Een of meer plekken met een kaartje en de route." },
];

export function newsBlockLabel(type: NewsBlockType): string {
  return NEWS_BLOCK_TYPES.find((entry) => entry.type === type)?.label ?? type;
}

/**
 * Een blok terwijl het bewerkt wordt. `newFiles` zijn foto's die de beheerder
 * net gekozen heeft maar die nog niet in Cloudinary staan: die gaan er pas bij
 * het opslaan naartoe (zie NewsManager).
 */
export type NewsBlockDraft = NewsBlock & { newFiles?: File[] };

export const emptyCard = (): NewsCardItem => ({ title: "", meta: "", body: "", bullets: [] });

export const emptyFaqItem = (): NewsFaqItem => ({ question: "", answer: "" });

export const emptyButton = (): NewsButtonItem => ({ label: "", url: "", style: "primary" });

export const emptyLocation = (): NewsLocationItem => ({ name: "", address: "" });

/** Een vers, leeg blok van het gekozen soort. */
export function emptyBlock(type: NewsBlockType): NewsBlockDraft {
  switch (type) {
    case "text":
      return { type: "text", title: "", body: "" };
    case "cards":
      return { type: "cards", title: "", intro: "", cards: [emptyCard()] };
    case "faq":
      return { type: "faq", title: "", intro: "", items: [emptyFaqItem()] };
    case "photos":
      return { type: "photos", title: "", images: [], newFiles: [] };
    case "buttons":
      return { type: "buttons", title: "", intro: "", buttons: [emptyButton()] };
    case "locations":
      return { type: "locations", title: "", intro: "", locations: [emptyLocation()] };
  }
}

/** Haalt `newFiles` er weer af: dat veld hoort niet in de database thuis. */
export function toStoredBlock(draft: NewsBlockDraft): NewsBlock {
  const { newFiles, ...block } = draft as NewsBlockDraft & { newFiles?: File[] };
  return block as NewsBlock;
}

/** Alle Cloudinary-foto's die in een lijst blokken zitten. */
export function draftImages(blocks: NewsBlockDraft[]): string[] {
  return blocks.flatMap((block) => (block.type === "photos" ? block.images : []));
}
