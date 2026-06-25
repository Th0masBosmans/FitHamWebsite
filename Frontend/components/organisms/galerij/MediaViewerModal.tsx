"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaGallery } from "@/types";

// How many neighbours on each side of the current image to fetch ahead of time.
const PRELOAD_RADIUS = 2;
// Above this count the dot strip is windowed so it doesn't overflow the frame.
const MAX_DOTS = 11;

// Module-level cache: keeps decoded <img> elements alive across modal opens so
// revisiting an image (or reopening an album) is instant and never re-fetches.
const imageCache = new Map<string, HTMLImageElement>();

function preloadImage(url: string) {
  if (typeof window === "undefined" || imageCache.has(url)) return;
  const image = new window.Image();
  image.src = url;
  imageCache.set(url, image);
}

type MediaViewerModalProps = {
  gallery: MediaGallery | null;
  mediaIndex: number;
  onClose: () => void;
  onSelectMedia: (index: number) => void;
}

export function MediaViewerModal({ gallery, mediaIndex, onClose, onSelectMedia }: MediaViewerModalProps) {
  const hasMultiple = (gallery?.media.length ?? 0) > 1;

  // Pagination + caching: only fetch a window of neighbouring images around the
  // current one (not the whole album) and keep them warm in the module cache so
  // next/prev is instant and revisiting never re-downloads.
  useEffect(() => {
    const media = gallery?.media;
    if (!media || media.length === 0) return;
    for (let offset = -PRELOAD_RADIUS; offset <= PRELOAD_RADIUS; offset++) {
      const item = media[(mediaIndex + offset + media.length) % media.length];
      if (item?.type === "image") preloadImage(item.url);
    }
  }, [gallery, mediaIndex]);

  const goPrev = () => {
    if (!gallery) return;
    onSelectMedia((mediaIndex - 1 + gallery.media.length) % gallery.media.length);
  };
  const goNext = () => {
    if (!gallery) return;
    onSelectMedia((mediaIndex + 1) % gallery.media.length);
  };

  return (
    <AnimatePresence>
      {gallery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {/* Media stage — media fills the full width; tall photos are scaled down to fit the
                height cap (whole photo always shown, never cropped, never oversized). */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* FitHam backdrop fills the side padding behind the image (matches the login page) */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-brand-darker)] via-[var(--color-primary-brand)] to-[var(--color-primary-brand-dark)]" />
                <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-[var(--color-secondary-brand)] opacity-25 blur-3xl" />
                <div className="absolute bottom-[-25%] left-[-15%] h-[75%] w-[75%] rounded-full bg-[var(--color-accent)] opacity-15 blur-3xl" />
                <div
                  className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                  style={{ backgroundImage: "url('/assets/background-pattern.png')", backgroundSize: "480px" }}
                />
              </div>

              {gallery.media[mediaIndex].type === "video" ? (
                <video
                  src={gallery.media[mediaIndex].url}
                  controls
                  autoPlay
                  className="relative mx-auto block h-auto max-h-[80vh] w-full bg-black object-contain"
                />
              ) : (
                <img
                  src={gallery.media[mediaIndex].url}
                  alt={gallery.media[mediaIndex].caption}
                  className="relative mx-auto block h-auto max-h-[80vh] w-full object-contain"
                />
              )}

              {/* Close - top right */}
              <button
                onClick={onClose}
                aria-label="Sluiten"
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Counter - bottom right */}
              {hasMultiple && (
                <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-3 py-1 text-white backdrop-blur-md label-small font-semibold">
                  {mediaIndex + 1} / {gallery.media.length}
                </span>
              )}

              {/* Prev / Next */}
              {hasMultiple && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Vorige"
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md shadow-lg transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-primary-brand)] hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Volgende"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md shadow-lg transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-primary-brand)] hover:scale-105 active:scale-95"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Caption overlay - frosted, over the image */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/95 via-[var(--color-primary-brand-darker)]/55 to-transparent p-5 pt-12">
                <h3 className="text-white label-xl font-black italic uppercase tracking-tight leading-tight drop-shadow-lg">
                  {gallery.title}
                </h3>
                <p className="mt-1 text-white/85 body-small font-semibold">{gallery.media[mediaIndex].caption}</p>
              </div>
            </div>

            {/* Dots — windowed for large albums so the strip never overflows */}
            {hasMultiple &&
              (() => {
                const total = gallery.media.length;
                const start = Math.max(0, Math.min(mediaIndex - Math.floor(MAX_DOTS / 2), total - MAX_DOTS));
                const end = Math.min(total, start + MAX_DOTS);
                return (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array.from({ length: end - start }, (_, dotIndex) => start + dotIndex).map((index) => (
                      <button
                        key={index}
                        onClick={() => onSelectMedia(index)}
                        aria-label={`Ga naar foto ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          index === mediaIndex ? "w-6 bg-[var(--color-accent)]" : "w-2.5 bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                );
              })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
