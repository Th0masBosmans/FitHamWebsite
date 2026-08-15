import type { GetStaticProps } from "next";
import { HomeContent } from "@/components/pages/public/HomeContent";
import { SiteImageRepository } from "@/repository/siteImageRepository";

// De grote foto bovenaan de homepagina. De beheerder kiest die in het
// beheerpaneel onder tab "Home" bij de plek "Home - Herobanner"; die plek staat
// onder deze sleutel in data/siteImageSlots.
const HOME_HERO_PAGE = "home-hero";

const siteImageRepository = new SiteImageRepository();

export default function HomePage({ heroImageUrl }: { heroImageUrl: string | null }) {
  return <HomeContent heroImageUrl={heroImageUrl} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const heroImage = await siteImageRepository.fetchSiteImageByPage(HOME_HERO_PAGE);
  const heroImageUrl = heroImage ? siteImageRepository.getSiteImageUrl(heroImage.image) : null;

  // Deze pagina wordt vooraf klaargezet, maar ververst zichzelf elke 60 seconden.
  // Zo verschijnt een nieuwe herobanner vanzelf, zonder de site opnieuw te publiceren.
  return { props: { heroImageUrl }, revalidate: 60 };
};
