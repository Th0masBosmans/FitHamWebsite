"use client";

import { useEffect, useState } from "react";
import { Plus, Briefcase, Link as LinkIcon } from "lucide-react";
import { SponsorRepository, type Sponsor } from "@/repository/sponsorRepository";
import { ActionButton, EmptyState, SubmitButton, InputField, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { extractFormString } from "./adminHelpers";

const sponsorRepository = new SponsorRepository();

/** Sponsors tab: list + add/edit modal + delete confirmation. */
export function SponsorsManager({ active }: { active: boolean }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [saving, setSaving] = useState(false);
  const [sponsorModal, setSponsorModal] = useState<{ isOpen: boolean; item?: Sponsor } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    sponsorRepository.fetchSponsors().then(setSponsors);
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
    const website_url = extractFormString(formData, "url") || null;

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    setSaving(true);
    try {
      if (sponsorModal?.item?.id != null) {
        const updated = await sponsorRepository.updateSponsor(sponsorModal.item.id, { name, image: sponsorModal.item.image, website_url }, file);
        setSponsors((previous) => previous.map((sponsor) => (sponsor.id === updated.id ? updated : sponsor)));
      } else {
        if (!file) throw new Error("Selecteer een afbeelding.");
        const created = await sponsorRepository.postSponsor({ name, website_url, image: file });
        setSponsors((previous) => [...previous, created]);
      }
      setSponsorModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const sponsorId = pendingDeleteId;
    const sponsor = sponsors.find((item) => item.id === sponsorId);
    sponsorRepository
      .deleteSponsor(sponsorId, sponsor?.image)
      .then(() => setSponsors((previous) => previous.filter((item) => item.id !== sponsorId)))
      .catch((error) => alert(`Kon de sponsor niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <>
      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setSponsorModal({ isOpen: true })} icon={Plus} label="Nieuwe Sponsor" labelShort="Sponsor" primary />
      </div>
      {sponsors.map((sponsor) => {
        const sponsorId = String(sponsor.id);
        return (
          <ExpandableListItem
            key={sponsorId}
            title={sponsor.name}
            subtitle="Actieve Sponsor"
            icon={Briefcase}
            image={sponsorRepository.getSponsorImageUrl(sponsor.image)}
            isExpanded={expandedId === sponsorId}
            onToggle={() => setExpandedId((previous) => (previous === sponsorId ? null : sponsorId))}
            onEdit={() => setSponsorModal({ isOpen: true, item: sponsor })}
            onDelete={() => setPendingDeleteId(sponsor.id!)}
            details={[
              {
                label: "Website",
                value: sponsor.website_url ? (
                  <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary-brand)] hover:underline flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> {sponsor.website_url.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="text-gray-400">Geen website</span>
                ),
              },
            ]}
          />
        );
      })}
      {sponsors.length === 0 && <EmptyState msg="Geen sponsoren gevonden." />}

      {sponsorModal && (
        <ModalWrapper title={sponsorModal.item ? "Sponsor Bewerken" : "Nieuwe Sponsor"} onClose={() => setSponsorModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Naam" name="name" defaultValue={sponsorModal.item?.name} required />
            <InputField label="Website URL" name="url" type="url" defaultValue={sponsorModal.item?.website_url ?? undefined} />
            <ImageUploadZone label="Logo (Afbeelding)" name="logo" defaultValue={sponsorModal.item ? sponsorRepository.getSponsorImageUrl(sponsorModal.item.image) : undefined} />
            <SubmitButton label={saving ? "Bezig met opslaan..." : sponsorModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </>
  );
}
