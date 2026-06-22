import { supabase } from "@/supabase";
import { ClubEvent } from "@/types";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { ClubEvent };

class EventRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchEvents(): Promise<ClubEvent[]> {
    // Embed the linked album's media keys so the UI knows whether there are photos to show.
    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, location, start_date, end_date, image, highlighted, album_id, album:albums(images)")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Failed to fetch events:", error.message);
      return [];
    }

    return (data ?? []).map((row) => {
      const { album, ...event } = row as typeof row & { album: { images: string[] | null } | null };
      return { ...event, albumMediaCount: album?.images?.length ?? 0 } as ClubEvent;
    });
  }

  async postEvent(event: Omit<ClubEvent, "id" | "image"> & { image: File }): Promise<ClubEvent> {
    const publicId = await this.uploadToCloudinary(event.image);

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: event.title,
        description: event.description,
        location: event.location,
        start_date: event.start_date,
        end_date: event.end_date,
        image: publicId,
        highlighted: event.highlighted,
        album_id: event.album_id,
      })
      .select("id, title, description, location, start_date, end_date, image, highlighted, album_id")
      .single();

    if (error || !data) {
      // Insert failed: remove the just-uploaded image so Cloudinary stays unchanged.
      await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon het evenement niet toevoegen, probeer opnieuw.");
    }

    return data;
  }

  async updateEvent(id: number, event: Omit<ClubEvent, "id">, newImage?: File): Promise<ClubEvent> {
    // event.image holds the current public id; only replace it once the DB update succeeds.
    const oldPublicId = event.image;
    const publicId = newImage ? await this.uploadToCloudinary(newImage) : event.image;

    const { data, error } = await supabase
      .from("events")
      .update({
        title: event.title,
        description: event.description,
        location: event.location,
        start_date: event.start_date,
        end_date: event.end_date,
        image: publicId,
        highlighted: event.highlighted,
        album_id: event.album_id,
      })
      .eq("id", id)
      .select("id, title, description, location, start_date, end_date, image, highlighted, album_id")
      .single();

    if (error || !data) {
      if (newImage) {
        await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      }
      if (error) throw error;
      throw new Error("Kon het evenement niet bijwerken, probeer opnieuw.");
    }

    if (newImage && oldPublicId && oldPublicId !== publicId) {
      await this.deleteFromCloudinary(oldPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }

    return data;
  }

  async deleteEvent(id: number, imagePublicId?: string): Promise<void> {
    const { error } = await supabase.from("events").delete().eq("id", id);
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

  getEventImageUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }
}

export { EventRepository };
