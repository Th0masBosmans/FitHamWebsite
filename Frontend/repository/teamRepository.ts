import { supabase } from "@/supabase";
import { Team, Player, StaffMember, TrainingDay, Division } from "@/types";
import { CloudinaryRepository } from "./cloudinaryRepository";

export type { Team, Player, StaffMember, TrainingDay, Division };

const PLAYER_COLUMNS = "id, team_id, name, position, sort_order";
const STAFF_COLUMNS = "id, team_id, name, role, photo, sort_order";
const TRAINING_COLUMNS = "id, team_id, day, time, sort_order";
const TEAM_COLUMNS = `id, name, description, division, photo_url, reeks, volley_club_id, sort_order, players(${PLAYER_COLUMNS}), staff(${STAFF_COLUMNS}), training_days(${TRAINING_COLUMNS})`;

// Children are returned in an arbitrary order by the embed; sort them by sort_order then id for a stable UI.
const bySortOrder = <T extends { sort_order?: number; id?: number }>(a: T, b: T) =>
  (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id ?? 0) - (b.id ?? 0);

class TeamRepository {
  private cloudinary = new CloudinaryRepository();

  async fetchTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select(TEAM_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Failed to fetch teams:", error.message);
      return [];
    }

    return (data ?? []).map((row) => {
      const team = row as unknown as Team;
      return {
        ...team,
        players: [...(team.players ?? [])].sort(bySortOrder),
        staff: [...(team.staff ?? [])].sort(bySortOrder),
        training_days: [...(team.training_days ?? [])].sort(bySortOrder),
      };
    });
  }

  async fetchTeam(id: number): Promise<Team | null> {
    const { data, error } = await supabase.from("teams").select(TEAM_COLUMNS).eq("id", id).single();

    if (error) {
      console.error("Failed to fetch team:", error.message);
      return null;
    }

    const team = data as unknown as Team;
    return {
      ...team,
      players: [...(team.players ?? [])].sort(bySortOrder),
      staff: [...(team.staff ?? [])].sort(bySortOrder),
      training_days: [...(team.training_days ?? [])].sort(bySortOrder),
    };
  }

  // --- Teams ---

  async postTeam(
    team: { name: string; description: string | null; division: Division; reeks: string | null; volley_club_id: string | null },
    photoFile?: File
  ): Promise<Team> {
    const publicId = photoFile ? await this.cloudinary.uploadToCloudinary(photoFile, 300) : null;

    const { data, error } = await supabase
      .from("teams")
      .insert({ name: team.name, description: team.description, division: team.division, photo_url: publicId, reeks: team.reeks, volley_club_id: team.volley_club_id })
      .select("id, name, description, division, photo_url, reeks, volley_club_id, sort_order")
      .single();

    if (error || !data) {
      if (publicId) await this.cloudinary.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon het team niet toevoegen, probeer opnieuw.");
    }

    return { ...(data as Omit<Team, "players" | "staff" | "training_days">), players: [], staff: [], training_days: [] };
  }

  async updateTeam(
    id: number,
    team: { name: string; description: string | null; division: Division; photo_url: string | null; reeks: string | null; volley_club_id: string | null },
    newPhoto?: File
  ): Promise<Omit<Team, "players" | "staff" | "training_days">> {
    const oldPublicId = team.photo_url;
    const publicId = newPhoto ? await this.cloudinary.uploadToCloudinary(newPhoto, 300) : team.photo_url;

    const { data, error } = await supabase
      .from("teams")
      .update({ name: team.name, description: team.description, division: team.division, photo_url: publicId, reeks: team.reeks, volley_club_id: team.volley_club_id })
      .eq("id", id)
      .select("id, name, description, division, photo_url, reeks, volley_club_id, sort_order")
      .single();

    if (error || !data) {
      if (newPhoto && publicId) await this.cloudinary.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      if (error) throw error;
      throw new Error("Kon het team niet bijwerken, probeer opnieuw.");
    }

    if (newPhoto && oldPublicId && oldPublicId !== publicId) {
      await this.cloudinary.deleteFromCloudinary(oldPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }

    return data as Omit<Team, "players" | "staff" | "training_days">;
  }

  // Deleting a team cascades to its players/staff/training_days in the DB; we still clean up
  // the team photo and every staff photo from Cloudinary ourselves.
  async deleteTeam(id: number, photoPublicId?: string | null, staffPhotos: (string | null)[] = []): Promise<void> {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) throw error;

    const toRemove = [photoPublicId, ...staffPhotos].filter((p): p is string => Boolean(p));
    await Promise.all(toRemove.map((p) => this.cloudinary.deleteFromCloudinary(p).catch((error) => console.error("Cloudinary cleanup failed:", error))));
  }

  // --- Players ---

  async addPlayer(teamId: number, player: { name: string; position: string }): Promise<Player> {
    const { data, error } = await supabase
      .from("players")
      .insert({ team_id: teamId, name: player.name, position: player.position })
      .select(PLAYER_COLUMNS)
      .single();
    if (error || !data) throw error ?? new Error("Kon de speler niet toevoegen, probeer opnieuw.");
    return data as Player;
  }

  async updatePlayer(id: number, player: { name: string; position: string }): Promise<Player> {
    const { data, error } = await supabase
      .from("players")
      .update({ name: player.name, position: player.position })
      .eq("id", id)
      .select(PLAYER_COLUMNS)
      .single();
    if (error || !data) throw error ?? new Error("Kon de speler niet bijwerken, probeer opnieuw.");
    return data as Player;
  }

  async deletePlayer(id: number): Promise<void> {
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) throw error;
  }

  // --- Staff ---

  async addStaff(teamId: number, member: { name: string; role: string }, photoFile?: File): Promise<StaffMember> {
    const publicId = photoFile ? await this.cloudinary.uploadToCloudinary(photoFile, 300) : null;

    const { data, error } = await supabase
      .from("staff")
      .insert({ team_id: teamId, name: member.name, role: member.role, photo: publicId })
      .select(STAFF_COLUMNS)
      .single();

    if (error || !data) {
      if (publicId) await this.cloudinary.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      throw error ?? new Error("Kon het staflid niet toevoegen, probeer opnieuw.");
    }

    return data as StaffMember;
  }

  async updateStaff(id: number, member: { name: string; role: string; photo: string | null }, newPhoto?: File): Promise<StaffMember> {
    const oldPublicId = member.photo;
    const publicId = newPhoto ? await this.cloudinary.uploadToCloudinary(newPhoto, 300) : member.photo;

    const { data, error } = await supabase
      .from("staff")
      .update({ name: member.name, role: member.role, photo: publicId })
      .eq("id", id)
      .select(STAFF_COLUMNS)
      .single();

    if (error || !data) {
      if (newPhoto && publicId) await this.cloudinary.deleteFromCloudinary(publicId).catch((error) => console.error("Cloudinary rollback failed:", error));
      throw error ?? new Error("Kon het staflid niet bijwerken, probeer opnieuw.");
    }

    if (newPhoto && oldPublicId && oldPublicId !== publicId) {
      await this.cloudinary.deleteFromCloudinary(oldPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
    }

    return data as StaffMember;
  }

  async deleteStaff(id: number, photoPublicId?: string | null): Promise<void> {
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) throw error;
    if (photoPublicId) await this.cloudinary.deleteFromCloudinary(photoPublicId).catch((error) => console.error("Cloudinary cleanup failed:", error));
  }

  // --- Training days ---

  async addTrainingDay(teamId: number, training: { day: string; time: string }): Promise<TrainingDay> {
    const { data, error } = await supabase
      .from("training_days")
      .insert({ team_id: teamId, day: training.day, time: training.time })
      .select(TRAINING_COLUMNS)
      .single();
    if (error || !data) throw error ?? new Error("Kon de training niet toevoegen, probeer opnieuw.");
    return data as TrainingDay;
  }

  async updateTrainingDay(id: number, training: { day: string; time: string }): Promise<TrainingDay> {
    const { data, error } = await supabase
      .from("training_days")
      .update({ day: training.day, time: training.time })
      .eq("id", id)
      .select(TRAINING_COLUMNS)
      .single();
    if (error || !data) throw error ?? new Error("Kon de training niet bijwerken, probeer opnieuw.");
    return data as TrainingDay;
  }

  async deleteTrainingDay(id: number): Promise<void> {
    const { error } = await supabase.from("training_days").delete().eq("id", id);
    if (error) throw error;
  }

  // --- Image URLs ---

  getTeamPhotoUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }

  getStaffPhotoUrl(publicId: string): string {
    return this.cloudinary.getImageUrl(publicId);
  }
}

export { TeamRepository };
