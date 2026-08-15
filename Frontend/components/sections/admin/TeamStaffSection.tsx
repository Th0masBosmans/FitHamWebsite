"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { UserPlus, Briefcase, Edit2, Trash2 } from "lucide-react";
import { TeamRepository, type Team, type StaffMember } from "@/repository/teamRepository";
import { ActionButton, IconButton, EmptyState, SubmitButton, InputField, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { MultiAddToggle } from "./MultiAddToggle";
import { AddedToast } from "./AddedToast";
import { useAddedToast } from "./useAddedToast";
import { extractFormString, keepAddAnotherChecked } from "./adminHelpers";

const teamRepository = new TeamRepository();

/** Staff (coaches/trainers) CRUD within an expanded team. */
export function TeamStaffSection({ team, setTeams }: { team: Team; setTeams: Dispatch<SetStateAction<Team[]>> }) {
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; item?: StaffMember } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [photoKey, setPhotoKey] = useState(0);
  const { addedMessage, showAddedMessage, clearAddedMessage } = useAddedToast();
  const teamId = team.id!;

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = extractFormString(formData, "name");
    const role = extractFormString(formData, "role");
    const addAnother = !modal?.item && formData.get("addAnother") === "on";

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    setSaving(true);
    try {
      if (modal?.item?.id != null) {
        const updated = await teamRepository.updateStaff(modal.item.id, { name, role, photo: modal.item.photo }, file);
        setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, staff: current.staff.map((member) => (member.id === updated.id ? updated : member)) } : current)));
      } else {
        const created = await teamRepository.addStaff(teamId, { name, role }, file);
        setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, staff: [...current.staff, created] } : current)));
      }
      if (addAnother) {
        form.reset();
        keepAddAnotherChecked(form);
        // ImageUploadZone houdt eigen preview-state; remount via key zodat de foto ook leeg is.
        setPhotoKey((key) => key + 1);
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
    const staffId = pendingDeleteId;
    const member = team.staff.find((item) => item.id === staffId);
    teamRepository
      .deleteStaff(staffId, member?.photo ?? null)
      .then(() => setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, staff: current.staff.filter((staffMember) => staffMember.id !== staffId) } : current))))
      .catch((error) => alert(`Kon het staflid niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider">Staff (coaches/trainers)</h4>
        <ActionButton onClick={() => setModal({ isOpen: true })} icon={UserPlus} label="Staff Toevoegen" labelShort="Toevoegen" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {team.staff.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              {member.photo ? (
                <img src={teamRepository.getStaffPhotoUrl(member.photo)} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-primary-brand)]/20 shrink-0" />
              ) : (
                <Briefcase className="w-5 h-5 text-[var(--color-primary-brand)]" />
              )}
              <div>
                <p className="font-black text-gray-800 uppercase tracking-tight">{member.name}</p>
                <p className="text-xs font-bold text-[var(--color-primary-brand)] uppercase tracking-wider">{member.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <IconButton onClick={() => setModal({ isOpen: true, item: member })} icon={Edit2} />
              <IconButton onClick={() => setPendingDeleteId(member.id!)} icon={Trash2} danger />
            </div>
          </div>
        ))}
        {team.staff.length === 0 && <EmptyState msg="Nog geen staff toegevoegd." />}
      </div>

      {modal && (
        <ModalWrapper title={modal.item ? "Staff Bewerken" : "Nieuwe Staff"} onClose={() => { setModal(null); clearAddedMessage(); }}>
          <form onSubmit={handleSave} className="space-y-5">
            <AddedToast message={addedMessage} />
            <InputField label="Naam" name="name" defaultValue={modal.item?.name} required />
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Rol</label>
              <select name="role" defaultValue={modal.item?.role || "Coach"} className="w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm bg-gray-50 focus:border-[var(--color-primary-brand)] focus:bg-white outline-none transition-colors">
                <option value="Coach">Coach</option>
                <option value="Assistent-Coach">Assistent-Coach</option>
                <option value="Trainer">Trainer</option>
              </select>
            </div>
            <ImageUploadZone key={photoKey} label="Foto" name="photo" defaultValue={modal.item?.photo ? teamRepository.getStaffPhotoUrl(modal.item.photo) : undefined} required={false} />
            {!modal.item && <MultiAddToggle />}
            <SubmitButton label={saving ? "Bezig met opslaan..." : modal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </div>
  );
}
