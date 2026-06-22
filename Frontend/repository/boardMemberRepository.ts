import { supabase } from "@/supabase";
import { BoardMember } from "@/types";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { BoardMember };

const COLUMNS = "id, name, function, email, profile_picture";

class BoardMemberRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchBoardMembers(): Promise<BoardMember[]> {
    const { data, error } = await supabase
      .from("board_members")
      .select(COLUMNS)
      .order("id", { ascending: true });

    if (error) {
      console.error("Failed to fetch board members:", error.message);
      return [];
    }

    return data ?? [];
  }

  async postBoardMember(member: { name: string; function: string; email: string; profile_picture: File }): Promise<BoardMember> {
    const publicId = await this.uploadToCloudinary(member.profile_picture);

    const { data, error } = await supabase
      .from("board_members")
      .insert({
        name: member.name,
        function: member.function,
        email: member.email,
        profile_picture: publicId,
      })
      .select(COLUMNS)
      .single();

    if (error || !data) {
      // Insert failed: remove the just-uploaded image so Cloudinary stays unchanged.
      await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon het bestuurslid niet toevoegen, probeer opnieuw.");
    }

    return data;
  }

  async updateBoardMember(id: number, member: Omit<BoardMember, "id">, newImage?: File): Promise<BoardMember> {
    // member.profile_picture holds the current public id; only replace it once the DB update succeeds.
    const oldPublicId = member.profile_picture;
    const publicId = newImage ? await this.uploadToCloudinary(newImage) : member.profile_picture;

    const { data, error } = await supabase
      .from("board_members")
      .update({
        name: member.name,
        function: member.function,
        email: member.email,
        profile_picture: publicId,
      })
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error || !data) {
      if (newImage) {
        await this.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      }
      if (error) throw error;
      throw new Error("Kon het bestuurslid niet bijwerken, probeer opnieuw.");
    }

    if (newImage && oldPublicId && oldPublicId !== publicId) {
      await this.deleteFromCloudinary(oldPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }

    return data;
  }

  async deleteBoardMember(id: number, imagePublicId?: string): Promise<void> {
    const { error } = await supabase.from("board_members").delete().eq("id", id);
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

  getProfilePictureUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }
}

export { BoardMemberRepository };
