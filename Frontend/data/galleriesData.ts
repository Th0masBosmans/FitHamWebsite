import type { Album, GalleryCategory, GalleryTag, MediaGallery, MediaItem } from "@/types";

export const categories: GalleryCategory[] = ["alles", "wedstrijden", "evenementen", "jeugd", "senioren"];

export const categoryLabels: Record<GalleryCategory, string> = {
  alles: "Alles",
  wedstrijden: "Wedstrijden",
  evenementen: "Evenementen",
  jeugd: "Jeugd",
  senioren: "Senioren",
};

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "m4v"];
const TAG_SET = new Set<string>(categories.filter((category) => category !== "alles"));

function mediaTypeFor(path: string): MediaItem["type"] {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.includes(extension) ? "video" : "image";
}

/**
 * Vertaalt een rij uit de tabel `albums` naar wat de galerijpagina toont.
 *
 * Let op de twee verschillende opslagplaatsen: de cover staat in Cloudinary
 * (vandaar getCoverUrl), de foto's en filmpjes zelf staan in Supabase Storage
 * in de map `albums` (vandaar getMediaUrl). De datum wordt hier in het
 * Nederlands gezet.
 */
export function albumToGallery(
  album: Album,
  getCoverUrl: (publicId: string) => string,
  getMediaUrl: (path: string) => string
): MediaGallery {
  const tags = album.tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag): tag is GalleryTag => TAG_SET.has(tag));

  const date = new Date(album.date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const media: MediaItem[] = (album.images ?? []).map((path) => ({
    type: mediaTypeFor(path),
    url: getMediaUrl(path),
    caption: album.name,
  }));

  // Leeg album? Toon dan de cover, zodat de viewer nooit helemaal leeg is.
  if (media.length === 0) {
    media.push({ type: "image", url: getCoverUrl(album.cover_image), caption: album.name });
  }

  return {
    id: String(album.id),
    title: album.name,
    date,
    tags,
    coverImage: getCoverUrl(album.cover_image),
    media,
  };
}
