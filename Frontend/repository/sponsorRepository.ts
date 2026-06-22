import { supabase } from "@/supabase";
import { Sponsor } from "@/types";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { Sponsor };

class SponsorRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchSponsors(): Promise<Sponsor[]> {
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, image, website_url");

    if (error) {
      console.error("Failed to fetch sponsors:", error.message);
      return [];
    }

    return data ?? [];
  }

  async postSponsor(sponsor: { name: string; website_url: string | null; image: File }): Promise<Sponsor> {
    const publicId = await this.uploadToCloudinary(sponsor.image);

    const { data, error } = await supabase
      .from("sponsors")
      .insert({
        name: sponsor.name,
        image: publicId,
        website_url: sponsor.website_url,
      })
      .select("id, name, image, website_url")
      .single();

    if (error || !data) {
      // Insert failed: remove the just-uploaded image so Cloudinary stays unchanged.
      await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon de sponsor niet toevoegen, probeer opnieuw.");
    }

    return data;
  }

  async updateSponsor(id: number, sponsor: Omit<Sponsor, "id">, newImage?: File): Promise<Sponsor> {
    const oldPublicId = sponsor.image;
    const publicId = newImage ? await this.uploadToCloudinary(newImage) : sponsor.image;

    const { data, error } = await supabase
      .from("sponsors")
      .update({
        name: sponsor.name,
        image: publicId,
        website_url: sponsor.website_url,
      })
      .eq("id", id)
      .select("id, name, image, website_url")
      .single();

    if (error || !data) {
      if (newImage) {
        await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      }
      if (error) throw error;
      throw new Error("Kon de sponsor niet bijwerken, probeer opnieuw.");
    }

    if (newImage && oldPublicId && oldPublicId !== publicId) {
      await this.deleteFromCloudinary(oldPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }

    return data;
  }

  async deleteSponsor(id: number, imagePublicId?: string): Promise<void> {
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) throw error;

    if (imagePublicId) {
      await this.deleteFromCloudinary(imagePublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }
  }

  async uploadToCloudinary(file: File): Promise<string> {
    return this.cloudinary.uploadToCloudinary(file);
  }

  async deleteFromCloudinary(publicId: string): Promise<void> {
    return this.cloudinary.deleteFromCloudinary(publicId);
  }

  getSponsorImageUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }
}

export { SponsorRepository };
