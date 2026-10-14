import type { GetStaticProps } from "next";
import { HomeContent } from "@/components/pages/public/HomeContent";
import { SiteImageRepository } from "@/repository/siteImageRepository";

const HOME_HERO_PAGE = "home-hero";

const siteImageRepository = new SiteImageRepository();

export default function HomePage({ heroImageUrl }: { heroImageUrl: string | null }) {
  return <HomeContent heroImageUrl={heroImageUrl} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const heroImage = await siteImageRepository.fetchSiteImageByPage(HOME_HERO_PAGE);
  const heroImageUrl = heroImage ? siteImageRepository.getSiteImageUrl(heroImage.image) : null;

  return { props: { heroImageUrl }, revalidate: 60 };
};
