"use client";

import { Images, X } from "lucide-react";
import { AlbumRepository, type SlideshowImage } from "@/repository/albumRepository";

const albumRepository = new AlbumRepository();

/** Hero-slideshow strip at the top of the Foto's tab: photos picked from albums. */
export function SlideshowPanel({ slideshowImages, onRemove }: { slideshowImages: SlideshowImage[]; onRemove: (id: number) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[var(--color-primary-brand)] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"><Images className="w-4 h-4" /></div>
        <h4 className="font-black text-[var(--color-primary-brand)] uppercase tracking-wider text-sm">Slideshow</h4>
        <span className="ml-auto text-xs font-black text-gray-400 uppercase tracking-wider">{slideshowImages.length} foto&apos;s</span>
      </div>
      {slideshowImages.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {slideshowImages.map((slideshowImage) => (
            <div key={slideshowImage.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
              <img src={albumRepository.getMediaUrl(slideshowImage.image_path)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => slideshowImage.id != null && onRemove(slideshowImage.id)}
                title="Uit slideshow verwijderen"
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-sm shadow-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
          <Images className="w-6 h-6 text-gray-300" />
          <p className="text-xs font-bold text-gray-400">Nog geen foto&apos;s geselecteerd</p>
        </div>
      )}
    </div>
  );
}
