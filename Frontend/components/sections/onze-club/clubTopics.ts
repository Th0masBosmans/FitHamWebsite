import { Compass, History, Network, Award, ShieldCheck, HeartHandshake, type LucideIcon } from "lucide-react";

/**
 * De onderwerpen achter het menu-item "Onze Club". Deze ene lijst voedt zowel
 * het overzicht (/onze-club) als de titels van de onderliggende pagina's, zodat
 * een onderwerp bijwerken op één plek gebeurt.
 *
 * De slug is tegelijk het laatste stuk van het adres: /onze-club/<slug>. Voeg je
 * hier een onderwerp toe, maak dan ook pages/onze-club/<slug>.tsx aan.
 */
export type ClubTopic = {
  slug: string;
  label: string;
  /** De ondertitel onder de paginatitel; ook de omschrijving op de overzichtskaart. */
  description: string;
  icon: LucideIcon;
};

export const clubTopics: ClubTopic[] = [
  {
    slug: "missie-visie",
    label: "Missie & Visie",
    description: "Waar Fit Ham voor staat en waar we met de club naartoe willen.",
    icon: Compass,
  },
  {
    slug: "geschiedenis",
    label: "Geschiedenis",
    description: "Van de oprichting tot de club die we vandaag zijn.",
    icon: History,
  },
  {
    slug: "organigram",
    label: "Organigram",
    description: "Wie doet wat binnen de club, en bij wie je terechtkan.",
    icon: Network,
  },
  {
    slug: "kwaliteitslabels",
    label: "Kwaliteitslabels",
    description: "De labels die we het afgelopen seizoen behaalden.",
    icon: Award,
  },
  {
    slug: "verzekeringen",
    label: "Verzekeringen",
    description: "Hoe je als lid verzekerd bent en wat je doet na een ongeval.",
    icon: ShieldCheck,
  },
  {
    slug: "api",
    label: "API",
    description: "Ons Aanspreekpunt Integriteit, voor als er iets niet goed zit.",
    icon: HeartHandshake,
  },
];

/** Zoekt een onderwerp op zijn slug. Geeft undefined als de slug niet bestaat. */
export function findClubTopic(slug: string): ClubTopic | undefined {
  return clubTopics.find((topic) => topic.slug === slug);
}
