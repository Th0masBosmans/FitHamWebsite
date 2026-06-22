"use client";

import { Images, Trash2, Plus, Check } from "lucide-react";
import { AlbumRepository, type Album } from "@/repository/albumRepository";
import { ActionButton, EmptyState } from "./AdminControls";
import { isVideoPath } from "./adminHelpers";

const albumRepository = new AlbumRepository();

type AlbumMediaGridProps = {
  album: Album;
  selectedImages: string[];
  savingSlideshow: boolean;
  onToggleSelect: (path: string) => void;
  onAddToSlideshow: (paths: string[]) => void;
  onDeleteSelected: (albumId: number, paths: string[]) => void;
  onAddMedia: (album: Album) => void;
}

/** Expanded-album body: bulk-select media to add to the slideshow or delete, plus an add-media button. */
export function AlbumMediaGrid({ album, selectedImages, savingSlideshow, onToggleSelect, onAddToSlideshow, onDeleteSelected, onAddMedia }: AlbumMediaGridProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider">
          {selectedImages.length > 0 ? `${selectedImages.length} geselecteerd` : "Foto's & video's in dit album"}
        </h4>
        <div className="flex flex-wrap gap-2">
          {selectedImages.length > 0 && (
            <button
              type="button"
              onClick={() => onAddToSlideshow(selectedImages)}
              disabled={savingSlideshow}
              className="px-3 lg:px-5 py-2.5 lg:py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center gap-2 shadow-sm hover:shadow-md bg-[var(--color-primary-brand)] hover:bg-[var(--color-primary-brand)]/90 text-white disabled:opacity-60"
            >
              <Images className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Toevoegen aan slideshow ({selectedImages.length})</span>
            </button>
          )}
          {selectedImages.length > 0 && (
            <button
              type="button"
              onClick={() => onDeleteSelected(album.id!, selectedImages)}
              className="px-3 lg:px-5 py-2.5 lg:py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center gap-2 shadow-sm hover:shadow-md bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Verwijder ({selectedImages.length})</span>
            </button>
          )}
          <ActionButton onClick={() => onAddMedia(album)} icon={Plus} label="Media Toevoegen" labelShort="Media" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-2">
        {album.images.map((path) => {
          const selected = selectedImages.includes(path);
          return (
            <button
              type="button"
              key={path}
              onClick={() => onToggleSelect(path)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-gray-100 transition-all ${
                selected ? "border-[var(--color-primary-brand)] ring-2 ring-[var(--color-primary-brand)]/30" : "border-gray-200 hover:border-[var(--color-primary-brand)]/40"
              }`}
            >
              {isVideoPath(path) ? (
                <video src={albumRepository.getMediaUrl(path)} className="w-full h-full object-cover bg-black" />
              ) : (
                <img src={albumRepository.getMediaUrl(path)} alt="" className="w-full h-full object-cover" />
              )}
              {selected && <div className="absolute inset-0 bg-[var(--color-primary-brand)]/25" />}
              <span
                className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors ${
                  selected ? "bg-[var(--color-primary-brand)] border-[var(--color-primary-brand)] text-white" : "bg-white/80 border-white text-transparent"
                }`}
              >
                <Check className="w-4 h-4" />
              </span>
            </button>
          );
        })}
        {album.images.length === 0 && <div className="col-span-full"><EmptyState msg="Dit album heeft nog geen media." /></div>}
      </div>
    </>
  );
}
