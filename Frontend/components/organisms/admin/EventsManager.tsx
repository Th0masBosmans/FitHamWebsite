"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Plus, Calendar } from "lucide-react";
import { EventRepository, type ClubEvent } from "@/repository/eventRepository";
import { AlbumRepository, type Album } from "@/repository/albumRepository";
import { formatEventDate, formatEventTimeRange } from "@/lib/eventFormat";
import { categoryLabels } from "@/data/galleriesData";
import { ActionButton, EmptyState, SubmitButton, InputField, ImageUploadZone, ModalWrapper } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { extractFormString, toDatetimeLocal, ALBUM_TAGS } from "./adminHelpers";

const eventRepository = new EventRepository();
const albumRepository = new AlbumRepository();

type EventsManagerProps = {
  active: boolean;
  /** Shared with the Foto's tab so a newly created album shows up there too. */
  albums: Album[];
  setAlbums: Dispatch<SetStateAction<Album[]>>;
}

/** Events tab: list + add/edit modal (with optional photo-album linking) + delete confirmation. */
export function EventsManager({ active, albums, setAlbums }: EventsManagerProps) {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [eventModal, setEventModal] = useState<{ isOpen: boolean; item?: ClubEvent } | null>(null);
  const [eventAlbumMode, setEventAlbumMode] = useState<"none" | "existing" | "new">("none");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    eventRepository.fetchEvents().then(setEvents);
  }, []);

  useEffect(() => {
    if (!active) setExpandedId(null);
  }, [active]);

  // When the event modal opens, preselect "existing" if it's already linked to an album.
  useEffect(() => {
    if (eventModal?.isOpen) setEventAlbumMode(eventModal.item?.album_id != null ? "existing" : "none");
  }, [eventModal]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = extractFormString(formData, "title");
    const description = extractFormString(formData, "description");
    const location = extractFormString(formData, "location");
    const startInput = extractFormString(formData, "start_date");
    const start_date = new Date(startInput).toISOString();
    const endInput = extractFormString(formData, "end_date");
    const end_date = endInput ? new Date(endInput).toISOString() : null;
    const highlighted = formData.get("highlighted") === "on";

    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    setSaving(true);
    try {
      let album_id: number | null = null;
      if (eventAlbumMode === "existing") {
        const selected = extractFormString(formData, "album_id");
        album_id = selected ? Number(selected) : null;
      } else if (eventAlbumMode === "new") {
        if (!file) throw new Error("Selecteer een evenement-afbeelding; die wordt de albumcover.");
        const mediaInput = form.querySelector('input[name="album_media"]') as HTMLInputElement | null;
        const mediaFiles = mediaInput?.files ? Array.from(mediaInput.files) : [];
        const createdAlbum = await albumRepository.postAlbum({
          name: title,
          date: startInput.slice(0, 10),
          tags: formData.getAll("album_tags").join(","),
          coverFile: file,
          mediaFiles,
        });
        setAlbums((previous) => [createdAlbum, ...previous]);
        album_id = createdAlbum.id ?? null;
      }

      if (eventModal?.item?.id != null) {
        const updated = await eventRepository.updateEvent(eventModal.item.id, { title, description, location, start_date, end_date, image: eventModal.item.image, highlighted, album_id }, file);
        setEvents((previous) => previous.map((eventItem) => (eventItem.id === updated.id ? updated : eventItem)));
      } else {
        if (!file) throw new Error("Selecteer een afbeelding.");
        const created = await eventRepository.postEvent({ title, description, location, start_date, end_date, highlighted, album_id, image: file });
        setEvents((previous) => [...previous, created]);
      }
      setEventModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const eventId = pendingDeleteId;
    const clubEvent = events.find((item) => item.id === eventId);
    eventRepository
      .deleteEvent(eventId, clubEvent?.image)
      .then(() => setEvents((previous) => previous.filter((item) => item.id !== eventId)))
      .catch((error) => alert(`Kon het evenement niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <>
      <div className="flex justify-end mb-4">
        <ActionButton onClick={() => setEventModal({ isOpen: true })} icon={Plus} label="Nieuw Evenement" labelShort="Event" primary />
      </div>
      {events.map((clubEvent) => {
        const eventId = String(clubEvent.id);
        return (
          <ExpandableListItem
            key={eventId}
            title={clubEvent.title}
            subtitle={formatEventDate(clubEvent.start_date)}
            icon={Calendar}
            image={eventRepository.getEventImageUrl(clubEvent.image)}
            isExpanded={expandedId === eventId}
            onToggle={() => setExpandedId((previous) => (previous === eventId ? null : eventId))}
            onEdit={() => setEventModal({ isOpen: true, item: clubEvent })}
            onDelete={() => setPendingDeleteId(clubEvent.id!)}
            details={[
              { label: "Tijd", value: formatEventTimeRange(clubEvent.start_date, clubEvent.end_date) },
              { label: "Locatie", value: clubEvent.location },
              { label: "Status", value: clubEvent.highlighted ? <span className="text-[var(--color-primary-brand)] font-black">Uitgelicht</span> : "Standaard" },
              { label: "Album", value: clubEvent.album_id != null ? (albums.find((album) => album.id === clubEvent.album_id)?.name ?? "Gekoppeld") : <span className="text-gray-400">Geen</span> },
            ]}
            description={clubEvent.description}
          />
        );
      })}
      {events.length === 0 && <EmptyState msg="Geen evenementen gevonden." />}

      {eventModal && (
        <ModalWrapper title={eventModal.item ? "Evenement Bewerken" : "Nieuw Evenement"} onClose={() => setEventModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Titel" name="title" defaultValue={eventModal.item?.title} required />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InputField label="Start" name="start_date" type="datetime-local" defaultValue={eventModal.item ? toDatetimeLocal(eventModal.item.start_date) : undefined} required />
              <InputField label="Einde (optioneel)" name="end_date" type="datetime-local" defaultValue={eventModal.item?.end_date ? toDatetimeLocal(eventModal.item.end_date) : undefined} />
            </div>
            <InputField label="Locatie" name="location" defaultValue={eventModal.item?.location} required />
            <InputField label="Beschrijving" name="description" defaultValue={eventModal.item?.description} required isTextarea />
            <ImageUploadZone label="Evenement Afbeelding" name="image" defaultValue={eventModal.item ? eventRepository.getEventImageUrl(eventModal.item.image) : undefined} />
            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-pointer">
              <input type="checkbox" name="highlighted" defaultChecked={eventModal.item?.highlighted} className="w-5 h-5 accent-[var(--color-primary-brand)]" />
              <span className="font-black text-gray-700 uppercase tracking-wider text-sm">Uitgelicht Evenement</span>
            </label>

            {/* Album koppeling: geen, een bestaand album, of meteen een nieuw album aanmaken. */}
            <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Gekoppeld fotoalbum</label>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: "none", label: "Geen" },
                  { value: "existing", label: "Bestaand album" },
                  { value: "new", label: "Nieuw album" },
                ] as const).map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setEventAlbumMode(option.value)}
                    className={`px-4 py-2 rounded-xl border-2 font-black uppercase tracking-wider text-xs transition-colors ${
                      eventAlbumMode === option.value
                        ? "bg-[var(--color-primary-brand)] text-white border-[var(--color-primary-brand)]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary-brand)]/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {eventAlbumMode === "existing" && (
                <select
                  name="album_id"
                  defaultValue={eventModal.item?.album_id != null ? String(eventModal.item.album_id) : ""}
                  className="w-full border-2 border-gray-200 rounded-xl p-3.5 font-bold text-sm bg-white focus:border-[var(--color-primary-brand)] outline-none transition-colors"
                >
                  <option value="">Kies een album…</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>{album.name}</option>
                  ))}
                </select>
              )}

              {eventAlbumMode === "new" && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500">
                    De evenement-afbeelding hierboven wordt de cover. Naam en datum van het album komen van dit evenement.
                  </p>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {ALBUM_TAGS.map((tag) => (
                        <label key={tag} className="cursor-pointer">
                          <input type="checkbox" name="album_tags" value={tag} className="peer sr-only" />
                          <span className="inline-block px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-gray-500 font-black uppercase tracking-wider text-xs transition-colors peer-checked:bg-[var(--color-primary-brand)] peer-checked:text-white peer-checked:border-[var(--color-primary-brand)] hover:border-[var(--color-primary-brand)]/40">
                            {categoryLabels[tag]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <ImageUploadZone label="Foto's & video's voor het album" name="album_media" multiple accept="image/*,video/*" required={false} />
                </div>
              )}
            </div>

            <SubmitButton label={saving ? "Bezig met opslaan..." : eventModal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </>
  );
}
