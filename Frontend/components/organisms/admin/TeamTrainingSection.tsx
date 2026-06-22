"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Plus, Clock, Edit2, Trash2 } from "lucide-react";
import { TeamRepository, type Team, type TrainingDay } from "@/repository/teamRepository";
import { ActionButton, IconButton, EmptyState, SubmitButton, InputField, ModalWrapper } from "./AdminControls";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { MultiAddToggle } from "./MultiAddToggle";
import { AddedToast } from "./AddedToast";
import { useAddedToast } from "./useAddedToast";
import { extractFormString, keepAddAnotherChecked } from "./adminHelpers";

const teamRepository = new TeamRepository();

/** Trainingstijden CRUD within an expanded team. */
export function TeamTrainingSection({ team, setTeams }: { team: Team; setTeams: Dispatch<SetStateAction<Team[]>> }) {
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; item?: TrainingDay } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { addedMessage, showAddedMessage, clearAddedMessage } = useAddedToast();
  const teamId = team.id!;

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const day = extractFormString(formData, "day");
    const time = extractFormString(formData, "time");
    const addAnother = !modal?.item && formData.get("addAnother") === "on";

    setSaving(true);
    try {
      if (modal?.item?.id != null) {
        const updated = await teamRepository.updateTrainingDay(modal.item.id, { day, time });
        setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, training_days: current.training_days.map((training) => (training.id === updated.id ? updated : training)) } : current)));
      } else {
        const created = await teamRepository.addTrainingDay(teamId, { day, time });
        setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, training_days: [...current.training_days, created] } : current)));
      }
      if (addAnother) {
        form.reset();
        keepAddAnotherChecked(form);
        (form.querySelector('input[name="time"]') as HTMLInputElement | null)?.focus();
        showAddedMessage("Training toegevoegd");
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
    const trainingId = pendingDeleteId;
    teamRepository
      .deleteTrainingDay(trainingId)
      .then(() => setTeams((previous) => previous.map((current) => (current.id === teamId ? { ...current, training_days: current.training_days.filter((training) => training.id !== trainingId) } : current))))
      .catch((error) => alert(`Kon de training niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider">Trainingstijden</h4>
        <ActionButton onClick={() => setModal({ isOpen: true })} icon={Plus} label="Training Toevoegen" labelShort="Toevoegen" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {team.training_days.map((training) => (
          <div key={training.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--color-primary-brand)]" />
              <div>
                <p className="font-black text-gray-800 uppercase tracking-tight">{training.day}</p>
                <p className="text-xs font-bold text-[var(--color-primary-brand)] uppercase tracking-wider">{training.time}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <IconButton onClick={() => setModal({ isOpen: true, item: training })} icon={Edit2} />
              <IconButton onClick={() => setPendingDeleteId(training.id!)} icon={Trash2} danger />
            </div>
          </div>
        ))}
        {team.training_days.length === 0 && <EmptyState msg="Nog geen trainingstijden ingesteld." />}
      </div>

      {modal && (
        <ModalWrapper title={modal.item ? "Training Bewerken" : "Nieuwe Training"} onClose={() => { setModal(null); clearAddedMessage(); }}>
          <form onSubmit={handleSave} className="space-y-5">
            <AddedToast message={addedMessage} />
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Dag</label>
              <select name="day" defaultValue={modal.item?.day || "Maandag"} className="w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm bg-gray-50 focus:border-[var(--color-primary-brand)] focus:bg-white outline-none transition-colors">
                <option value="Maandag">Maandag</option>
                <option value="Dinsdag">Dinsdag</option>
                <option value="Woensdag">Woensdag</option>
                <option value="Donderdag">Donderdag</option>
                <option value="Vrijdag">Vrijdag</option>
                <option value="Zaterdag">Zaterdag</option>
                <option value="Zondag">Zondag</option>
              </select>
            </div>
            <InputField label="Tijd (bv. 19:00 - 21:00)" name="time" defaultValue={modal.item?.time} required />
            {!modal.item && <MultiAddToggle />}
            <SubmitButton label={saving ? "Bezig met opslaan..." : modal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </div>
  );
}
