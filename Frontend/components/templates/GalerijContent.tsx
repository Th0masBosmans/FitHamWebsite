"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { AlbumRepository } from "@/repository/albumRepository";
import { albumToGallery } from "@/data/galleriesData";
import type { GalleryCategory, GalleryTag, MediaGallery } from "@/types";
import { HeroCarousel, type HeroSlide } from "@/components/organisms/galerij/HeroCarousel";
import { CategoryFilter } from "@/components/organisms/galerij/CategoryFilter";
import { GalleryCard } from "@/components/organisms/galerij/GalleryCard";
import { MediaViewerModal } from "@/components/organisms/galerij/MediaViewerModal";

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

  // Fetches one page of albums and appends it (or replaces, when starting at 0).
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

  // Deep link from an event ("?album=<id>"): fetch that album and open it straight away.
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

  // The hero slideshow shows photos the admin picked from albums (not the covers).
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

  // Until the admin curates the slideshow, fall back to album covers so the hero isn't empty.
  const heroSlides =
    slideshowSlides.length > 0
      ? slideshowSlides
      : galleries.map((gallery) => ({ url: gallery.coverImage, caption: gallery.title }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pb-8">
      {/* Hero Image Carousel with Parallax Effect */}
      <HeroCarousel slides={heroSlides} />

      <div className="max-w-md lg:max-w-7xl mx-auto px-6">
        {/* Category Filter */}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Gallery Grid */}
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

        {/* Load more — fetches the next 15 albums */}
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

      {/* Media Viewer Modal */}
      <MediaViewerModal
        gallery={selectedGallery}
        mediaIndex={selectedMediaIndex}
        onClose={() => setSelectedGallery(null)}
        onSelectMedia={setSelectedMediaIndex}
      />
    </motion.div>
  );
}
