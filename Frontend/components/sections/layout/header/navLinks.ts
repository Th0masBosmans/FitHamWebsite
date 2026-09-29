import { clubTopics } from "@/components/sections/onze-club/clubTopics";

/**
 * De menulinks van de site. Deze ene lijst voedt zowel de balk op desktop
 * (DesktopNav) als het uitschuifmenu op mobiel (MobileNavDrawer). Een pagina
 * toevoegen aan het menu doe je hier.
 *
 * Een item met "children" is geen eigen pagina maar een menu dat openklapt; de
 * onderliggende links staan dan in children. Zie "Onze Club": die onderwerpen
 * komen uit clubTopics, zodat ze maar op één plek beschreven staan.
 */
export type NavChild = {
  path: string;
  label: string;
  /** Korte uitleg onder de titel, in het uitklapmenu op desktop. */
  description?: string;
}

export type NavLink = {
  label: string;
  /** Het adres van de pagina. Ontbreekt bij een item dat alleen een menu opent. */
  path?: string;
  /** De links die verschijnen als dit item openklapt. */
  children?: NavChild[];
}

export const navLinks: NavLink[] = [
  {
    label: "Onze Club",
    children: clubTopics.map((topic) => ({
      path: `/onze-club/${topic.slug}`,
      label: topic.label,
      description: topic.description,
    })),
  },
  { path: "/teams", label: "Teams" },
  { path: "/galerij", label: "Foto's" },
  { path: "/events", label: "Evenementen" },
  { path: "/sponsors", label: "sponsors" },
  { path: "/contact", label: "Contact" },
];

/** Of een menu-item de pagina is waar je nu staat (ook bij een openklapbaar item). */
export function isNavLinkActive(link: NavLink, activePath: string): boolean {
  if (link.path) return activePath === link.path;
  return link.children?.some((child) => activePath === child.path) ?? false;
}
