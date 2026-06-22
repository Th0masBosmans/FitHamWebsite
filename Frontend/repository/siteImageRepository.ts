import { supabase } from "@/supabase";
import { SiteImage } from "@/types";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { SiteImage };

const COLUMNS = "id, name, page, image";

class SiteImageRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchSiteImages(): Promise<SiteImage[]> {
    const { data, error } = await supabase
      .from("site_images")
      .select(COLUMNS)
      .order("id", { ascending: true });

    if (error) {
      console.error("Failed to fetch site images:", error.message);
      return [];
    }

    return data ?? [];
  }

  async fetchSiteImageByPage(page: string): Promise<SiteImage | null> {
    const { data, error } = await supabase
      .from("site_images")
      .select(COLUMNS)
      .ilike("page", page)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch site image by page:", error.message);
      return null;
    }

    return data;
  }

  async postSiteImage(siteImage: { name: string; page: string; image: File }): Promise<SiteImage> {
    const publicId = await this.uploadToCloudinary(siteImage.image);

    const { data, error } = await supabase
      .from("site_images")
      .insert({
        name: siteImage.name,
        page: siteImage.page,
        image: publicId,
      })
      .select(COLUMNS)
      .single();

    if (error || !data) {
      // Insert failed: remove the just-uploaded image so Cloudinary stays unchanged.
      await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon de afbeelding niet toevoegen, probeer opnieuw.");
    }

    return data;
  }

  async updateSiteImage(id: number, siteImage: Omit<SiteImage, "id">, newImage?: File): Promise<SiteImage> {
    // siteImage.image holds the current public id; only replace it once the DB update succeeds.
    const oldPublicId = siteImage.image;
    const publicId = newImage ? await this.uploadToCloudinary(newImage) : siteImage.image;

    const { data, error } = await supabase
      .from("site_images")
      .update({
        name: siteImage.name,
        page: siteImage.page,
        image: publicId,
      })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (newImage) {
        await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      }
      if (error) throw error;
      throw new Error("Kon de afbeelding niet bijwerken, probeer opnieuw.");
    }

    if (newImage && oldPublicId && oldPublicId !== publicId) {
      await this.deleteFromCloudinary(oldPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }

    return data;
  }

  async deleteSiteImage(id: number, imagePublicId?: string): Promise<void> {
    const { error } = await supabase.from("site_images").delete().eq("id", id);
    if (error) throw error;

    if (imagePublicId) {
      await this.deleteFromCloudinary(imagePublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }
  }

  async uploadToCloudinary(file: File): Promise<string> {
    return this.cloudinary.uploadToCloudinary(file, 300);
  }

  async deleteFromCloudinary(publicId: string): Promise<void> {
    return this.cloudinary.deleteFromCloudinary(publicId);
  }

  getSiteImageUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }
}

export { SiteImageRepository };
