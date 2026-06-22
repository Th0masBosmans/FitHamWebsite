"use client";

import { useEffect, useState } from "react";
import { Plus, Euro, Check } from "lucide-react";
import { MembershipRepository, type MembershipFee } from "@/repository/membershipRepository";
import { ActionButton, EmptyState, SubmitButton, InputField, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { extractFormString } from "./adminHelpers";

const membershipRepository = new MembershipRepository();

/** Lidgeld tab: fees list + add/edit modal + delete confirmation. */
export function MembershipsManager({ active }: { active: boolean }) {
  const [memberships, setMemberships] = useState<MembershipFee[]>([]);
  const [saving, setSaving] = useState(false);
  const [membershipModal, setMembershipModal] = useState<{ isOpen: boolean; item?: MembershipFee } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    membershipRepository.fetchFees().then(setMemberships);
  }, []);

  useEffect(() => {
    if (!active) setExpandedId(null);
  }, [active]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const formData = new FormData(event.currentTarget);
    const benefits = extractFormString(formData, "benefits").split("\n").map((benefit) => benefit.trim()).filter(Boolean);
    const fee = {
      name: extractFormString(formData, "name"),
      description: extractFormString(formData, "description"),
      price: Number(extractFormString(formData, "price")),
      benefits,
    };

    setSaving(true);
    try {
      if (membershipModal?.item?.id != null) {
        const updated = await membershipRepository.updateFee(membershipModal.item.id, fee);
        setMemberships((previous) => previous.map((membership) => (membership.id === updated.id ? updated : membership)));
      } else {
        const created = await membershipRepository.postFee(fee);
        setMemberships((previous) => [...previous, created]);
      }
      setMembershipModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const membershipId = pendingDeleteId;
    membershipRepository
      .deleteFee(membershipId)
      .then(() => setMemberships((previous) => previous.filter((item) => item.id !== membershipId)))
      .catch((error) => alert(`Kon het lidgeld niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <>
      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setMembershipModal({ isOpen: true })} icon={Plus} label="Nieuw Lidgeld" labelShort="Lidgeld" primary />
      </div>
      {memberships.map((plan) => {
        const planId = String(plan.id);
        return (
          <ExpandableListItem
            key={planId}
            title={plan.name}
            subtitle={`€${plan.price} / jaar`}
            icon={Euro}
            isExpanded={expandedId === planId}
            onToggle={() => setExpandedId((previous) => (previous === planId ? null : planId))}
            onEdit={() => setMembershipModal({ isOpen: true, item: plan })}
            onDelete={() => setPendingDeleteId(plan.id!)}
            description={plan.description}
          >
            <div className="mt-2">
              <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Inbegrepen Voordelen</span>
              <ul className="grid grid-cols-1 gap-3">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm font-bold text-gray-700">
                    <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ExpandableListItem>
        );
      })}
      {memberships.length === 0 && <EmptyState msg="Geen lidgeld gevonden." />}

      {membershipModal && (
        <ModalWrapper title={membershipModal.item ? "Lidgeld Bewerken" : "Nieuw Lidgeld"} onClose={() => setMembershipModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Naam" name="name" defaultValue={membershipModal.item?.name} required />
            <InputField label="Prijs (€)" name="price" type="number" defaultValue={membershipModal.item?.price?.toString()} required />
            <InputField label="Korte Beschrijving" name="description" defaultValue={membershipModal.item?.description} required />
            <InputField label="Voordelen (Eén per regel)" name="benefits" defaultValue={membershipModal.item?.benefits.join("\n")} required isTextarea />
            <SubmitButton label={saving ? "Bezig met opslaan..." : membershipModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </>
  );
}
