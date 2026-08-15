"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { AlbumRepository, type Album, type SlideshowImage } from "@/repository/albumRepository";
import { categoryLabels } from "@/data/galleriesData";
import { ActionButton, EmptyState, SubmitButton, InputField, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SlideshowPanel } from "./SlideshowPanel";
import { AlbumMediaGrid } from "./AlbumMediaGrid";
import { extractFormString, formatAlbumDate, isVideoPath, ALBUM_TAGS } from "./adminHelpers";

const albumRepository = new AlbumRepository();

type PendingDelete = { kind: "album"; id: number } | { kind: "albumImages"; albumId: number; paths: string[] };

type AlbumsManagerProps = {
  active: boolean;
  albums: Album[];
  setAlbums: Dispatch<SetStateAction<Album[]>>;
}

/** Foto's tab: slideshow manager + album list (per-album media grid) + add/edit modal + delete confirmation. */
export function AlbumsManager({ active, albums, setAlbums }: AlbumsManagerProps) {
  const [slideshowImages, setSlideshowImages] = useState<SlideshowImage[]>([]);
  const [savingSlideshow, setSavingSlideshow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [albumModal, setAlbumModal] = useState<{ isOpen: boolean; item?: Album } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    albumRepository.fetchSlideshowImages().then(setSlideshowImages);
  }, []);

  useEffect(() => {
    if (!active) {
      setExpandedId(null);
      setSelectedImages([]);
    }
  }, [active]);

  const handleToggleExpand = (id: string) => {
    setExpandedId((previous) => (previous === id ? null : id));
    setSelectedImages([]);
  };

  const toggleImageSelection = (path: string) =>
    setSelectedImages((previous) => (previous.includes(path) ? previous.filter((item) => item !== path) : [...previous, path]));

  const handleAddToSlideshow = async (paths: string[]) => {
    if (savingSlideshow) return;
    const photos = paths.filter((path) => !isVideoPath(path));
    if (photos.length === 0) {
      alert("Selecteer minstens één foto (video's kunnen niet in de slideshow).");
      return;
    }
    setSavingSlideshow(true);
    try {
      const added = await albumRepository.addSlideshowImages(photos);
      setSlideshowImages((previous) => [...previous, ...added]);
      setSelectedImages([]);
    } catch (error) {
      alert(`Toevoegen aan slideshow mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSavingSlideshow(false);
    }
  };

  const handleRemoveFromSlideshow = async (id: number) => {
    const previousImages = slideshowImages;
    setSlideshowImages((previous) => previous.filter((image) => image.id !== id));
    try {
      await albumRepository.removeSlideshowImage(id);
    } catch (error) {
      setSlideshowImages(previousImages);
      alert(`Verwijderen uit slideshow mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = extractFormString(formData, "name");
    const date = extractFormString(formData, "date");
    const tags = formData.getAll("tags").join(",");

    const coverInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const coverFile = coverInput?.files?.[0];
    const mediaInput = form.querySelector('input[name="media"]') as HTMLInputElement | null;
    const mediaFiles = mediaInput?.files ? Array.from(mediaInput.files) : [];

    setSaving(true);
    try {
      if (albumModal?.item?.id != null) {
        const updated = await albumRepository.updateAlbum(
          albumModal.item.id,
          { name, date, tags, cover_image: albumModal.item.cover_image, images: albumModal.item.images },
          coverFile,
          mediaFiles
        );
        setAlbums((previous) => previous.map((album) => (album.id === updated.id ? updated : album)));
      } else {
        if (!coverFile) throw new Error("Selecteer een cover afbeelding.");
        const created = await albumRepository.postAlbum({ name, date, tags, coverFile, mediaFiles });
        setAlbums((previous) => [created, ...previous]);
      }
      setAlbumModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "album") {
      const albumId = pendingDelete.id;
      const album = albums.find((item) => item.id === albumId);
      albumRepository
        .deleteAlbum(albumId, album?.cover_image ?? "", album?.images ?? [])
        .then(() => setAlbums((previous) => previous.filter((item) => item.id !== albumId)))
        .catch((error) => alert(`Kon het album niet verwijderen: ${error.message}`));
    } else {
      const { albumId, paths } = pendingDelete;
      const album = albums.find((item) => item.id === albumId);
      if (album) {
        albumRepository
          .removeAlbumImages(albumId, album.images, paths)
          .then((updated) => {
            setAlbums((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
            setSelectedImages([]);
          })
          .catch((error) => alert(`Kon de media niet verwijderen: ${error.message}`));
      }
    }
    setPendingDelete(null);
  };

  if (!active) return null;

  return (
    <>
      <SlideshowPanel slideshowImages={slideshowImages} onRemove={handleRemoveFromSlideshow} />

      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setAlbumModal({ isOpen: true })} icon={Plus} label="Nieuw Album" labelShort="Album" primary />
      </div>
      {albums.map((album) => {
        const albumId = String(album.id);
        return (
          <ExpandableListItem
            key={albumId}
            title={album.name}
            subtitle={`${formatAlbumDate(album.date)} • ${album.images.length} media`}
            icon={ImageIcon}
            image={albumRepository.getCoverUrl(album.cover_image)}
            isExpanded={expandedId === albumId}
            onToggle={() => handleToggleExpand(albumId)}
            onEdit={() => setAlbumModal({ isOpen: true, item: album })}
            onDelete={() => setPendingDelete({ kind: "album", id: album.id! })}
            details={[
              {
                label: "Tags",
                value: album.tags.trim() ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {album.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="bg-[var(--color-secondary-brand)]/10 text-[var(--color-primary-brand)] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">#{tag}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">Geen tags</span>
                ),
              },
            ]}
          >
            <AlbumMediaGrid
              album={album}
              selectedImages={selectedImages}
              savingSlideshow={savingSlideshow}
              onToggleSelect={toggleImageSelection}
              onAddToSlideshow={handleAddToSlideshow}
              onDeleteSelected={(albumIdToDelete, paths) => setPendingDelete({ kind: "albumImages", albumId: albumIdToDelete, paths })}
              onAddMedia={(albumToEdit) => setAlbumModal({ isOpen: true, item: albumToEdit })}
            />
          </ExpandableListItem>
        );
      })}
      {albums.length === 0 && <EmptyState msg="Geen albums gevonden." />}

      {albumModal && (
        <ModalWrapper title={albumModal.item ? "Album Bewerken" : "Nieuw Album"} onClose={() => setAlbumModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Naam" name="name" defaultValue={albumModal.item?.name} required />
            <InputField label="Datum" name="date" type="date" defaultValue={albumModal.item?.date} required />
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {ALBUM_TAGS.map((tag) => {
                  const selected = (albumModal.item?.tags ?? "")
                    .split(",")
                    .map((value) => value.trim().toLowerCase())
                    .includes(tag);
                  return (
                    <label key={tag} className="cursor-pointer">
                      <input type="checkbox" name="tags" value={tag} defaultChecked={selected} className="peer sr-only" />
                      <span className="inline-block px-4 py-2 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 font-black uppercase tracking-wider text-xs transition-colors peer-checked:bg-[var(--color-primary-brand)] peer-checked:text-white peer-checked:border-[var(--color-primary-brand)] hover:border-[var(--color-primary-brand)]/40">
                        {categoryLabels[tag]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <ImageUploadZone label="Cover afbeelding" name="cover" defaultValue={albumModal.item ? albumRepository.getCoverUrl(albumModal.item.cover_image) : undefined} />
            <ImageUploadZone
              label={albumModal.item ? "Media toevoegen (foto's & video's)" : "Foto's & video's"}
              name="media"
              multiple
              accept="image/*,video/*"
              required={false}
            />
            <SubmitButton label={saving ? "Bezig met opslaan..." : albumModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDelete && <DeleteConfirmModal onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />}
    </>
  );
}
