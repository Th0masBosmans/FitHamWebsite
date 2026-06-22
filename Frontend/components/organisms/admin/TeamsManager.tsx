"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { TeamRepository, type Team, type Division } from "@/repository/teamRepository";
import { ActionButton, EmptyState, SubmitButton, InputField, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { TeamTrainingSection } from "./TeamTrainingSection";
import { TeamStaffSection } from "./TeamStaffSection";
import { TeamPlayersSection } from "./TeamPlayersSection";
import { extractFormString } from "./adminHelpers";

const teamRepository = new TeamRepository();

/** Teams tab: team CRUD + an expandable roster editor (training/staff/players) per team. */
export function TeamsManager({ active }: { active: boolean }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [saving, setSaving] = useState(false);
  const [teamModal, setTeamModal] = useState<{ isOpen: boolean; item?: Team } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    teamRepository.fetchTeams().then(setTeams);
  }, []);

  useEffect(() => {
    if (!active) setExpandedId(null);
  }, [active]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = extractFormString(formData, "name");
    // Description is no longer editable in the admin panel; keep whatever's stored.
    const description = teamModal?.item?.description ?? null;
    const division = extractFormString(formData, "division") as Division;
    const reeks = extractFormString(formData, "reeks").trim() || null;
    const volley_club_id = extractFormString(formData, "volley_club_id").trim() || null;

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    setSaving(true);
    try {
      if (teamModal?.item?.id != null) {
        const updated = await teamRepository.updateTeam(teamModal.item.id, { name, description, division, photo_url: teamModal.item.photo_url, reeks, volley_club_id }, file);
        setTeams((previous) => previous.map((team) => (team.id === updated.id ? { ...team, ...updated } : team)));
      } else {
        const created = await teamRepository.postTeam({ name, description, division, reeks, volley_club_id }, file);
        setTeams((previous) => [...previous, created]);
      }
      setTeamModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const teamId = pendingDeleteId;
    const team = teams.find((item) => item.id === teamId);
    teamRepository
      .deleteTeam(teamId, team?.photo_url ?? null, team?.staff.map((member) => member.photo) ?? [])
      .then(() => setTeams((previous) => previous.filter((item) => item.id !== teamId)))
      .catch((error) => alert(`Kon het team niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <>
      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setTeamModal({ isOpen: true })} icon={Plus} label="Nieuw Team" labelShort="Team" primary />
      </div>
      {teams.map((team) => {
        const teamId = String(team.id);
        return (
          <ExpandableListItem
            key={teamId}
            title={team.name}
            subtitle={`${team.players.length} Spelers`}
            icon={Users}
            image={team.photo_url ? teamRepository.getTeamPhotoUrl(team.photo_url) : ""}
            isExpanded={expandedId === teamId}
            onToggle={() => setExpandedId((previous) => (previous === teamId ? null : teamId))}
            onEdit={() => setTeamModal({ isOpen: true, item: team })}
            onDelete={() => setPendingDeleteId(team.id!)}
            wideImage
          >
            <TeamTrainingSection team={team} setTeams={setTeams} />
            <TeamStaffSection team={team} setTeams={setTeams} />
            <TeamPlayersSection team={team} setTeams={setTeams} />
          </ExpandableListItem>
        );
      })}
      {teams.length === 0 && <EmptyState msg="Geen teams gevonden." />}

      {teamModal && (
        <ModalWrapper title={teamModal.item ? "Team Bewerken" : "Nieuw Team"} onClose={() => setTeamModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Team Naam" name="name" defaultValue={teamModal.item?.name} required />
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Categorie</label>
              <select name="division" defaultValue={teamModal.item?.division || "jeugd"} className="w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm bg-gray-50 focus:border-[var(--color-primary-brand)] focus:bg-white outline-none transition-colors">
                <option value="jeugd">Jeugd</option>
                <option value="dames">Dames</option>
                <option value="heren">Heren</option>
                <option value="recreatie">Recreatie</option>
              </select>
            </div>
            <ImageUploadZone label="Team Foto" name="photoUrl" defaultValue={teamModal.item?.photo_url ? teamRepository.getTeamPhotoUrl(teamModal.item.photo_url) : undefined} required={false} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InputField label="VolleyAdmin reeks (bv. LHP1)" name="reeks" defaultValue={teamModal.item?.reeks ?? undefined} />
              <InputField label="Stamnummer" name="volley_club_id" defaultValue={teamModal.item?.volley_club_id ?? "L-0759"} />
            </div>
            <p className="text-xs font-bold text-gray-400 -mt-2">
              Vul de reeks in om de live rangschikking en wedstrijd van deze week op de teampagina te tonen. Laat leeg voor teams zonder competitie.
            </p>
            <SubmitButton label={saving ? "Bezig met opslaan..." : teamModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </>
  );
}
