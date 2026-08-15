"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { AlbumRepository } from "@/repository/albumRepository";
import { albumToGallery } from "@/data/galleriesData";
import type { GalleryCategory, GalleryTag, MediaGallery } from "@/types";
import { HeroCarousel, type HeroSlide } from "@/components/sections/galerij/HeroCarousel";
import { CategoryFilter } from "@/components/sections/galerij/CategoryFilter";
import { GalleryCard } from "@/components/sections/galerij/GalleryCard";
import { MediaViewerModal } from "@/components/sections/galerij/MediaViewerModal";

const albumRepository = new AlbumRepository();
const PAGE_SIZE = 15;

export function GalerijContent() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<MediaGallery[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("alles");
  const [selectedGallery, setSelectedGallery] = useState<MediaGallery | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [slideshowSlides, setSlideshowSlides] = useState<HeroSlide[]>([]);

  // Haalt een reeks albums op en plakt ze achter de vorige. Beginnen we bij 0,
  // dan vervangen we de lijst (eerste keer laden).
  const loadPage = useCallback(async (offset: number) => {
    const batch = await albumRepository.fetchAlbums({ limit: PAGE_SIZE, offset });
    const mapped = batch.map((album) =>
      albumToGallery(album, (id) => albumRepository.getCoverUrl(id), (path) => albumRepository.getMediaUrl(path))
    );
    setGalleries((prev) => (offset === 0 ? mapped : [...prev, ...mapped]));
    setHasMore(batch.length === PAGE_SIZE);
  }, []);

  useEffect(() => {
    loadPage(0).finally(() => setLoaded(true));
  }, [loadPage]);

  // Kom je hier via de knop bij een evenement, dan staat het albumnummer in de
  // URL ("?album=12"). Dat album halen we apart op en openen we meteen, ook als
  // het nog niet in de geladen lijst zit.
  useEffect(() => {
    if (!router.isReady) return;
    const { album } = router.query;
    if (typeof album !== "string") return;
    albumRepository.fetchAlbumById(Number(album)).then((row) => {
      if (!row) return;
      setSelectedGallery(
        albumToGallery(row, (id) => albumRepository.getCoverUrl(id), (path) => albumRepository.getMediaUrl(path))
      );
      setSelectedMediaIndex(0);
    });
  }, [router.isReady, router.query]);

  // De diavoorstelling bovenaan toont foto's die de beheerder zelf uitkoos
  // (tab "Foto's" in het beheerpaneel), niet zomaar de albumcovers.
  useEffect(() => {
    albumRepository.fetchSlideshowImages().then((images) =>
      setSlideshowSlides(images.map((image) => ({ url: albumRepository.getMediaUrl(image.image_path), caption: "" })))
    );
  }, []);

  const handleLoadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    loadPage(galleries.length).finally(() => setLoadingMore(false));
  };

  const filteredGalleries =
    selectedCategory === "alles"
      ? galleries
      : galleries.filter((gallery) => gallery.tags.includes(selectedCategory as GalleryTag));

  // Heeft de beheerder nog niets gekozen, dan tonen we de albumcovers, zodat
  // de diavoorstelling nooit leeg is.
  const heroSlides =
    slideshowSlides.length > 0
      ? slideshowSlides
      : galleries.map((gallery) => ({ url: gallery.coverImage, caption: gallery.title }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pb-8">
      {/* Diavoorstelling bovenaan */}
      <HeroCarousel slides={heroSlides} />

      <div className="max-w-md lg:max-w-7xl mx-auto px-6">
        {/* Knoppen om op categorie te filteren */}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Raster met albumkaartjes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredGalleries.map((gallery, index) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              index={index}
              onOpen={() => {
                setSelectedGallery(gallery);
                setSelectedMediaIndex(0);
              }}
            />
          ))}
        </div>

        {loaded && filteredGalleries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">Geen media gevonden in deze categorie</p>
          </div>
        )}

        {/* Knop die de volgende 15 albums bijhaalt */}
        {hasMore && (
          <div className="flex justify-center pt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full bg-white/15 backdrop-blur-md px-6 py-3 shadow-md text-white label-regular font-bold transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-primary-brand)] hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-white/15 disabled:hover:text-white"
            >
              {loadingMore ? "Laden..." : "Meer laden"}
            </button>
          </div>
        )}
      </div>

      {/* Het venster dat opengaat als je een album aanklikt */}
      <MediaViewerModal
        gallery={selectedGallery}
        mediaIndex={selectedMediaIndex}
        onClose={() => setSelectedGallery(null)}
        onSelectMedia={setSelectedMediaIndex}
      />
    </motion.div>
  );
}
