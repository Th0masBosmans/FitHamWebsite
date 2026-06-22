import { supabase } from "@/supabase";
import { Album, SlideshowImage } from "@/types";
import { compressImage } from "@/lib/imageCompression";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { Album, SlideshowImage };

const BUCKET = "albums";
const COLUMNS = "id, name, cover_image, images, date, tags";
const SLIDESHOW_COLUMNS = "id, image_path";
// Covers go to Cloudinary uncompressed (they drive the hero slideshow); only fall
// back to client compression above this size to respect Cloudinary's upload limit.
const COVER_MAX_KB = 10000;

type AlbumFields = {
  name: string;
  date: string;
  tags: string;
  cover_image: string;
  images: string[];
};

class AlbumRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchAlbums(options?: { limit?: number; offset?: number }): Promise<Album[]> {
    let query = supabase.from("albums").select(COLUMNS).order("date", { ascending: false });

    if (options?.limit != null) {
      const offset = options.offset ?? 0;
      query = query.range(offset, offset + options.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch albums:", error.message);
      return [];
    }

    return data ?? [];
  }

  /** Fetches a single album by id (used to deep-link straight to an album from an event). */
  async fetchAlbumById(id: number): Promise<Album | null> {
    const { data, error } = await supabase.from("albums").select(COLUMNS).eq("id", id).single();

    if (error) {
      console.error("Failed to fetch album:", error.message);
      return null;
    }

    return data;
  }

  async postAlbum(input: { name: string; date: string; tags: string; coverFile: File; mediaFiles: File[] }): Promise<Album> {
    const cover_image = await this.uploadCover(input.coverFile);
    let images: string[];
    try {
      images = await Promise.all(input.mediaFiles.map((file) => this.uploadMedia(file)));
    } catch (error) {
      await this.deleteCover(cover_image);
      throw error;
    }

    const { data, error } = await supabase
      .from("albums")
      .insert({ name: input.name, date: input.date, tags: input.tags, cover_image, images })
      .select(COLUMNS)
      .single();

    if (error || !data) {
      // Insert failed: remove the just-uploaded files so the stores stay unchanged.
      await this.deleteCover(cover_image);
      await this.deleteMedia(images).catch((error) => console.error("Storage rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon het album niet toevoegen, probeer opnieuw.");
    }

    return data;
  }

  async updateAlbum(id: number, fields: AlbumFields, newCover?: File, newMediaFiles: File[] = []): Promise<Album> {
    const oldCover = fields.cover_image;
    const cover_image = newCover ? await this.uploadCover(newCover) : fields.cover_image;

    let addedImages: string[] = [];
    try {
      addedImages = await Promise.all(newMediaFiles.map((file) => this.uploadMedia(file)));
    } catch (error) {
      if (newCover) await this.deleteCover(cover_image);
      throw error;
    }
    const images = [...fields.images, ...addedImages];

    const { data, error } = await supabase
      .from("albums")
      .update({ name: fields.name, date: fields.date, tags: fields.tags, cover_image, images })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (newCover) await this.deleteCover(cover_image);
      await this.deleteMedia(addedImages).catch((error) => console.error("Storage rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon het album niet bijwerken, probeer opnieuw.");
    }

    if (newCover && oldCover && oldCover !== cover_image) {
      await this.deleteCover(oldCover);
    }

    return data;
  }

  /** Removes one or more images/videos from an album, in both the DB row and Storage. */
  async removeAlbumImages(id: number, currentImages: string[], paths: string[]): Promise<Album> {
    const remove = new Set(paths);
    const images = currentImages.filter((p) => !remove.has(p));

    const { data, error } = await supabase
      .from("albums")
      .update({ images })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (error) throw error;
      throw new Error("Kon de media niet verwijderen, probeer opnieuw.");
    }

    await this.deleteMedia(paths).catch((error) => console.error("Storage cleanup failed:", error));
    return data;
  }

  async deleteAlbum(id: number, coverPublicId: string, imagePaths: string[]): Promise<void> {
    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) throw error;

    await this.deleteCover(coverPublicId);
    await this.deleteMedia(imagePaths).catch((error) => console.error("Storage cleanup failed:", error));
  }

  /** Uploads the cover to Cloudinary (kept full quality) and returns its public id. */
  async uploadCover(file: File): Promise<string> {
    return this.cloudinary.uploadToCloudinary(file, COVER_MAX_KB);
  }

  async deleteCover(publicId: string): Promise<void> {
    if (!publicId) return;
    await this.cloudinary.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
  }

  /**
   * Uploads one media file to the `albums` bucket under a unique key and returns that
   * key. Images are downscaled + re-encoded as JPEG first to keep uploads fast; videos
   * are uploaded as-is (the browser can't transcode them).
   */
  async uploadMedia(file: File): Promise<string> {
    const isImage = file.type.startsWith("image/");
    const toUpload = isImage ? await compressImage(file, { quality: 70, maxDimension: 1920 }) : file;
    const extension = isImage ? "jpg" : (file.name.split(".").pop()?.toLowerCase() ?? "bin");
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, toUpload, { cacheControl: "3600", upsert: false, contentType: toUpload.type });
    if (error) throw new Error(`Upload naar Supabase Storage mislukt: ${error.message}`);

    return path;
  }

  async deleteMedia(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;
  }

  /** Cloudinary URL for a cover image (stored as a Cloudinary public id). */
  getCoverUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }

  /** Public URL for a media file stored under its key in the `albums` bucket. */
  getMediaUrl(path: string): string {
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  // --- Hero slideshow (curated album photos shown on the gallery page) ---

  async fetchSlideshowImages(): Promise<SlideshowImage[]> {
    const { data, error } = await supabase
      .from("slideshow_images")
      .select(SLIDESHOW_COLUMNS)
      .order("id", { ascending: true });

    if (error) {
      console.error("Failed to fetch slideshow images:", error.message);
      return [];
    }

    return data ?? [];
  }

  /** Adds album media (by Storage key) to the slideshow, ignoring any already present. */
  async addSlideshowImages(paths: string[]): Promise<SlideshowImage[]> {
    if (paths.length === 0) return [];

    const { data, error } = await supabase
      .from("slideshow_images")
      .upsert(paths.map((image_path) => ({ image_path })), { onConflict: "image_path", ignoreDuplicates: true })
      .select(SLIDESHOW_COLUMNS);

    if (error) throw error;
    return data ?? [];
  }

  async removeSlideshowImage(id: number): Promise<void> {
    const { error } = await supabase.from("slideshow_images").delete().eq("id", id);
    if (error) throw error;
  }
}

export { AlbumRepository };
