"use client";

import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { BoardMemberRepository, type BoardMember } from "@/repository/boardMemberRepository";
import { ActionButton, EmptyState, SubmitButton, InputField, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { extractFormString } from "./adminHelpers";

const boardMemberRepository = new BoardMemberRepository();

/** Contact tab: bestuursleden list + add/edit modal + delete confirmation. */
export function BoardManager({ active }: { active: boolean }) {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [boardMemberModal, setBoardMemberModal] = useState<{ isOpen: boolean; item?: BoardMember } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    boardMemberRepository.fetchBoardMembers().then(setBoardMembers);
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
    const functionTitle = extractFormString(formData, "function");
    const email = extractFormString(formData, "email");

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    setSaving(true);
    try {
      if (boardMemberModal?.item?.id != null) {
        const updated = await boardMemberRepository.updateBoardMember(
          boardMemberModal.item.id,
          { name, function: functionTitle, email, profile_picture: boardMemberModal.item.profile_picture },
          file
        );
        setBoardMembers((previous) => previous.map((member) => (member.id === updated.id ? updated : member)));
      } else {
        if (!file) throw new Error("Selecteer een afbeelding.");
        const created = await boardMemberRepository.postBoardMember({ name, function: functionTitle, email, profile_picture: file });
        setBoardMembers((previous) => [...previous, created]);
      }
      setBoardMemberModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const memberId = pendingDeleteId;
    const member = boardMembers.find((item) => item.id === memberId);
    boardMemberRepository
      .deleteBoardMember(memberId, member?.profile_picture)
      .then(() => setBoardMembers((previous) => previous.filter((item) => item.id !== memberId)))
      .catch((error) => alert(`Kon het bestuurslid niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <>
      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setBoardMemberModal({ isOpen: true })} icon={Plus} label="Nieuw Bestuurslid" labelShort="Bestuurslid" primary />
      </div>
      {boardMembers.map((member) => {
        const memberId = String(member.id);
        return (
          <ExpandableListItem
            key={memberId}
            title={member.name}
            subtitle={member.function}
            icon={UserPlus}
            image={boardMemberRepository.getProfilePictureUrl(member.profile_picture)}
            isExpanded={expandedId === memberId}
            onToggle={() => setExpandedId((previous) => (previous === memberId ? null : memberId))}
            onEdit={() => setBoardMemberModal({ isOpen: true, item: member })}
            onDelete={() => setPendingDeleteId(member.id!)}
            details={[
              { label: "Functie", value: member.function },
              { label: "Email", value: <a href={`mailto:${member.email}`} className="text-[var(--color-primary-brand)] hover:underline">{member.email}</a> },
            ]}
          />
        );
      })}
      {boardMembers.length === 0 && <EmptyState msg="Geen bestuursleden gevonden." />}

      {boardMemberModal && (
        <ModalWrapper title={boardMemberModal.item ? "Bestuurslid Bewerken" : "Nieuw Bestuurslid"} onClose={() => setBoardMemberModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Naam" name="name" defaultValue={boardMemberModal.item?.name} required />
            <InputField label="Functie" name="function" defaultValue={boardMemberModal.item?.function} required />
            <InputField label="Email" name="email" type="email" defaultValue={boardMemberModal.item?.email} required />
            <ImageUploadZone label="Profielfoto" name="profile_picture" defaultValue={boardMemberModal.item ? boardMemberRepository.getProfilePictureUrl(boardMemberModal.item.profile_picture) : undefined} />
            <SubmitButton label={saving ? "Bezig met opslaan..." : boardMemberModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </>
  );
}
