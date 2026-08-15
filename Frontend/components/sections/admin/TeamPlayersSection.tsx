"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { UserPlus, Edit2, Trash2 } from "lucide-react";
import { TeamRepository, type Team, type Player } from "@/repository/teamRepository";
import { ActionButton, IconButton, EmptyState, SubmitButton, InputField, ModalWrapper } from "./AdminControls";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { MultiAddToggle } from "./MultiAddToggle";
import { AddedToast } from "./AddedToast";
import { useAddedToast } from "./useAddedToast";
import { extractFormString, keepAddAnotherChecked } from "./adminHelpers";

const teamRepository = new TeamRepository();

/** Spelerslijst CRUD within an expanded team. */
export function TeamPlayersSection({ team, setTeams }: { team: Team; setTeams: Dispatch<SetStateAction<Team[]>> }) {
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; item?: Player } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { addedMessage, showAddedMessage, clearAddedMessage } = useAddedToast();
  const teamId = team.id!;

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = extractFormString(formData, "name");
    const position = extractFormString(formData, "position");
    const addAnother = !modal?.item && formData.get("addAnother") === "on";

    setSaving(true);
    try {
      if (modal?.item?.id != null) {
        const updated = await teamRepository.updatePlayer(modal.item.id, { name, position });
        setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, players: current.players.map((player) => (player.id === updated.id ? updated : player)) } : current)));
      } else {
        const created = await teamRepository.addPlayer(teamId, { name, position });
        setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, players: [...current.players, created] } : current)));
      }
      if (addAnother) {
        form.reset();
        keepAddAnotherChecked(form);
        (form.querySelector('input[name="name"]') as HTMLInputElement | null)?.focus();
        showAddedMessage(`${name} is toegevoegd`);
      } else {
        setModal(null);
      }
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const playerId = pendingDeleteId;
    teamRepository
      .deletePlayer(playerId)
      .then(() => setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, players: current.players.filter((player) => player.id !== playerId) } : current))))
      .catch((error) => alert(`Kon de speler niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider">Spelerslijst</h4>
        <ActionButton onClick={() => setModal({ isOpen: true })} icon={UserPlus} label="Speler Toevoegen" labelShort="Toevoegen" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {team.players.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
            <div>
              <p className="font-black text-gray-800 uppercase tracking-tight">{player.name}</p>
              <p className="text-xs font-bold text-[var(--color-primary-brand)] uppercase tracking-wider">{player.position}</p>
            </div>
            <div className="flex gap-2">
              <IconButton onClick={() => setModal({ isOpen: true, item: player })} icon={Edit2} />
              <IconButton onClick={() => setPendingDeleteId(player.id!)} icon={Trash2} danger />
            </div>
          </div>
        ))}
        {team.players.length === 0 && <EmptyState msg="Nog geen spelers in dit team." />}
      </div>

      {modal && (
        <ModalWrapper title={modal.item ? "Speler Bewerken" : "Nieuwe Speler"} onClose={() => { setModal(null); clearAddedMessage(); }}>
          <form onSubmit={handleSave} className="space-y-5">
            <AddedToast message={addedMessage} />
            <InputField label="Naam Speler" name="name" defaultValue={modal.item?.name} required />
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Positie in het veld</label>
              <select name="position" defaultValue={modal.item?.position || "Receptie Hoek"} className="w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm bg-gray-50 focus:border-[var(--color-primary-brand)] focus:bg-white outline-none transition-colors">
                <option value="Receptie Hoek">Receptie Hoek</option>
                <option value="Spelverdeler">Spelverdeler</option>
                <option value="Opposite">Opposite</option>
                <option value="Midden">Midden</option>
                <option value="Libero">Libero</option>
                <option value="All Round">All Round</option>
              </select>
            </div>
            {!modal.item && <MultiAddToggle />}
            <SubmitButton label={saving ? "Bezig met opslaan..." : modal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </div>
  );
}
