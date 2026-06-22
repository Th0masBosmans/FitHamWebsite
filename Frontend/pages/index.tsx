import type { GetStaticProps } from "next";
import { HomeContent } from "@/components/templates/HomeContent";
import { SiteImageRepository } from "@/repository/siteImageRepository";

// Admin: set a site image's "Pagina / Plek" to this value to drive the home hero.
const HOME_HERO_PAGE = "home-hero";

const siteImageRepository = new SiteImageRepository();

export default function HomePage({ heroImageUrl }: { heroImageUrl: string | null }) {
  return <HomeContent heroImageUrl={heroImageUrl} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const heroImage = await siteImageRepository.fetchSiteImageByPage(HOME_HERO_PAGE);
  const heroImageUrl = heroImage ? siteImageRepository.getSiteImageUrl(heroImage.image) : null;

  // Revalidate so admin changes to the hero appear without a redeploy.
  return { props: { heroImageUrl }, revalidate: 60 };
};
