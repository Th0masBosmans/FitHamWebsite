"use client";

import { Calendar, Images, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { categoryLabels } from "@/data/galleriesData";
import type { MediaGallery } from "@/types";

type GalleryCardProps = {
  gallery: MediaGallery;
  index: number;
  onOpen: () => void;
}

/**
 * Image-dominant poster card: the photo fills the card and only the title and
 * tags show by default. Hovering deepens the gradient and reveals the media
 * count (top-right) and the date (bottom-right).
 */
export function GalleryCard({ gallery, index, onOpen }: GalleryCardProps) {
  const reduceMotion = useReducedMotion();

  const photoCount = gallery.media.filter((item) => item.type === "image").length;
  const videoCount = gallery.media.length - photoCount;

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: reduceMotion ? 0 : (index % 2) * 0.08, ease: "easeOut" }}
      onClick={onOpen}
      className="group relative h-72 lg:h-80 cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <img
        src={gallery.coverImage}
        alt={gallery.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Light wash keeps the photo the star; a deeper gradient fades in on hover for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/55 via-transparent to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/85 via-[var(--color-primary-brand-darker)]/25 to-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Media count - top right, revealed on hover */}
      <div className="absolute right-3 top-3 z-10 flex gap-1.5 opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 shadow-sm text-white label-small font-semibold">
          <Images className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
          {photoCount}
        </span>
        {videoCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 shadow-sm text-white label-small font-semibold">
            <Play className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
            {videoCount}
          </span>
        )}
      </div>

      {/* Title - top left, always visible */}
      <div className="absolute left-4 right-4 top-4 z-10">
        <h3 className="text-white label-large font-black italic uppercase tracking-tight leading-tight drop-shadow-lg">
          {gallery.title}
        </h3>
      </div>

      {/* Bottom row: tags (left, always visible) + date (right, revealed on hover) */}
      <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {gallery.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-[var(--color-accent)] px-3 py-1 shadow-sm text-[var(--color-primary-brand)] label-small font-bold"
            >
              {categoryLabels[tag]}
            </span>
          ))}
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 shadow-sm text-white label-small font-semibold opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
          {gallery.date}
        </span>
      </div>
    </motion.article>
  );
}
