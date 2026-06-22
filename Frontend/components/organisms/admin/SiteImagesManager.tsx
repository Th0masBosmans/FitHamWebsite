"use client";

import { useEffect, useState } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import { SiteImageRepository, type SiteImage } from "@/repository/siteImageRepository";
import { SITE_IMAGE_SLOTS, getSiteImageSlotLabel } from "@/data/siteImageSlots";
import { ActionButton, EmptyState, SubmitButton, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { extractFormString } from "./adminHelpers";

const siteImageRepository = new SiteImageRepository();

/** Home tab: managed site images (e.g. the hero banner) + add/edit modal + delete confirmation. */
export function SiteImagesManager({ active }: { active: boolean }) {
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [siteImageModal, setSiteImageModal] = useState<{ isOpen: boolean; item?: SiteImage } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    siteImageRepository.fetchSiteImages().then(setSiteImages);
  }, []);

  useEffect(() => {
    if (!active) setExpandedId(null);
  }, [active]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const page = extractFormString(formData, "page");
    // Name is implied by the chosen slot so the admin only picks a spot + uploads.
    const name = getSiteImageSlotLabel(page);

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    setSaving(true);
    try {
      if (siteImageModal?.item?.id != null) {
        const updated = await siteImageRepository.updateSiteImage(siteImageModal.item.id, { name, page, image: siteImageModal.item.image }, file);
        setSiteImages((previous) => previous.map((siteImage) => (siteImage.id === updated.id ? updated : siteImage)));
      } else {
        if (!file) throw new Error("Selecteer een afbeelding.");
        const created = await siteImageRepository.postSiteImage({ name, page, image: file });
        setSiteImages((previous) => [...previous, created]);
      }
      setSiteImageModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const siteImageId = pendingDeleteId;
    const siteImage = siteImages.find((item) => item.id === siteImageId);
    siteImageRepository
      .deleteSiteImage(siteImageId, siteImage?.image)
      .then(() => setSiteImages((previous) => previous.filter((item) => item.id !== siteImageId)))
      .catch((error) => alert(`Kon de afbeelding niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <>
      <div className="bg-[var(--color-primary-brand)]/5 border border-[var(--color-primary-brand)]/10 rounded-2xl p-4 lg:p-5 flex items-start gap-3">
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[var(--color-primary-brand)] shrink-0 shadow-sm"><ImageIcon className="w-4 h-4" /></div>
        <div>
          <h4 className="font-black text-[var(--color-primary-brand)] uppercase tracking-wider text-xs mb-0.5">Home Pagina</h4>
          <p className="text-xs font-bold text-gray-600">Beheer hier de afbeeldingen op de homepagina. Kies een plek en upload een afbeelding &mdash; momenteel de grote herobanner bovenaan, later eventueel meer plekken.</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setSiteImageModal({ isOpen: true })} icon={Plus} label="Nieuwe Afbeelding" labelShort="Afbeelding" primary />
      </div>
      {siteImages.map((siteImage) => {
        const siteImageId = String(siteImage.id);
        return (
          <ExpandableListItem
            key={siteImageId}
            title={siteImage.name}
            subtitle={getSiteImageSlotLabel(siteImage.page)}
            icon={ImageIcon}
            image={siteImageRepository.getSiteImageUrl(siteImage.image)}
            isExpanded={expandedId === siteImageId}
            onToggle={() => setExpandedId((previous) => (previous === siteImageId ? null : siteImageId))}
            onEdit={() => setSiteImageModal({ isOpen: true, item: siteImage })}
            onDelete={() => setPendingDeleteId(siteImage.id!)}
            details={[{ label: "Plek op de site", value: getSiteImageSlotLabel(siteImage.page) }]}
          />
        );
      })}
      {siteImages.length === 0 && <EmptyState msg="Nog geen afbeeldingen ingesteld voor de homepagina." />}

      {siteImageModal && (
        <ModalWrapper title={siteImageModal.item ? "Afbeelding Bewerken" : "Nieuwe Afbeelding"} onClose={() => setSiteImageModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Plek op de site</label>
              <select name="page" defaultValue={siteImageModal.item?.page || SITE_IMAGE_SLOTS[0].page} className="w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm bg-gray-50 focus:border-[var(--color-primary-brand)] focus:bg-white outline-none transition-colors">
                {SITE_IMAGE_SLOTS.map((slot) => (
                  <option key={slot.page} value={slot.page}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            <ImageUploadZone label="Afbeelding" name="image" defaultValue={siteImageModal.item ? siteImageRepository.getSiteImageUrl(siteImageModal.item.image) : undefined} />
            <SubmitButton label={saving ? "Bezig met opslaan..." : siteImageModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </>
  );
}
