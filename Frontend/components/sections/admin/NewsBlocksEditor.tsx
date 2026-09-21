"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload, X } from "lucide-react";
import { NewsRepository } from "@/repository/newsRepository";
import type { NewsButtonItem, NewsCardItem, NewsFaqItem, NewsLocationItem } from "@/types";
import {
  NEWS_BLOCK_TYPES,
  emptyBlock,
  emptyButton,
  emptyCard,
  emptyFaqItem,
  emptyLocation,
  newsBlockLabel,
  type NewsBlockDraft,
} from "./newsBlocks";

const newsRepository = new NewsRepository();

/**
 * Het samenstellen van een nieuwspagina: blokken toevoegen, verplaatsen,
 * invullen en weggooien.
 *
 * Alles wordt hier in de staat van het formulier bijgehouden, niet in losse
 * invoervelden met een naam — een lijst die je kan herschikken past niet in de
 * gewone formulieraanpak van de andere tabbladen. Het opslaan gebeurt in
 * NewsManager, samen met de rest van het bericht.
 */
export function NewsBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: NewsBlockDraft[];
  onChange: (blocks: NewsBlockDraft[]) => void;
}) {
  // Het net toegevoegde blok in beeld schuiven, anders verschijnt het buiten
  // het venster en lijkt de klik niets te doen.
  const lastBlockRef = useRef<HTMLDivElement>(null);
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => {
    if (!justAdded) return;
    lastBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setJustAdded(false);
  }, [justAdded]);

  const addBlock = (type: NewsBlockDraft["type"]) => {
    onChange([...blocks, emptyBlock(type)]);
    setJustAdded(true);
  };

  const replaceAt = (index: number, block: NewsBlockDraft) =>
    onChange(blocks.map((current, currentIndex) => (currentIndex === index ? block : current)));

  const removeAt = (index: number) => onChange(blocks.filter((_, currentIndex) => currentIndex !== index));

  // Een blok een plaats omhoog of omlaag: de twee wisselen gewoon van plek.
  const moveBy = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Inhoud van de pagina</label>

      {blocks.map((block, index) => {
        const BlockIcon = NEWS_BLOCK_TYPES.find((entry) => entry.type === block.type)?.icon ?? Plus;
        return (
          <div
            key={index}
            ref={index === blocks.length - 1 ? lastBlockRef : undefined}
            className="space-y-3 rounded-xl border-2 border-gray-200 border-l-[var(--color-primary-brand)] bg-gray-50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--color-primary-brand)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary-brand)] text-white">
                  <BlockIcon className="h-3.5 w-3.5" />
                </span>
                {index + 1}. {newsBlockLabel(block.type)}
              </span>
              <div className="flex items-center gap-1">
                <SmallButton icon={ArrowUp} label="Omhoog" onClick={() => moveBy(index, -1)} disabled={index === 0} />
                <SmallButton icon={ArrowDown} label="Omlaag" onClick={() => moveBy(index, 1)} disabled={index === blocks.length - 1} />
                <SmallButton icon={Trash2} label="Blok verwijderen" onClick={() => removeAt(index)} danger />
              </div>
            </div>

            <TextInput
              label="Tussentitel"
              value={block.title}
              onChange={(title) => replaceAt(index, { ...block, title })}
            />

            {block.type === "text" && (
              <TextArea
                label="Tekst"
                value={block.body}
                rows={6}
                onChange={(body) => replaceAt(index, { ...block, body })}
                placeholder="Laat een lege regel tussen twee alinea's."
              />
            )}

            {block.type === "cards" && (
              <>
                <TextArea
                  label="Inleiding (optioneel)"
                  value={block.intro}
                  rows={3}
                  onChange={(intro) => replaceAt(index, { ...block, intro })}
                />
                {block.cards.map((card, cardIndex) => (
                  <CardFields
                    key={cardIndex}
                    card={card}
                    position={cardIndex + 1}
                    onChange={(next) =>
                      replaceAt(index, {
                        ...block,
                        cards: block.cards.map((current, currentIndex) => (currentIndex === cardIndex ? next : current)),
                      })
                    }
                    onRemove={() =>
                      replaceAt(index, { ...block, cards: block.cards.filter((_, currentIndex) => currentIndex !== cardIndex) })
                    }
                  />
                ))}
                <AddRowButton label="Kaartje toevoegen" onClick={() => replaceAt(index, { ...block, cards: [...block.cards, emptyCard()] })} />
              </>
            )}

            {block.type === "faq" && (
              <>
                <TextArea
                  label="Inleiding (optioneel)"
                  value={block.intro}
                  rows={3}
                  onChange={(intro) => replaceAt(index, { ...block, intro })}
                />
                {block.items.map((item, itemIndex) => (
                  <FaqFields
                    key={itemIndex}
                    item={item}
                    position={itemIndex + 1}
                    onChange={(next) =>
                      replaceAt(index, {
                        ...block,
                        items: block.items.map((current, currentIndex) => (currentIndex === itemIndex ? next : current)),
                      })
                    }
                    onRemove={() =>
                      replaceAt(index, { ...block, items: block.items.filter((_, currentIndex) => currentIndex !== itemIndex) })
                    }
                  />
                ))}
                <AddRowButton label="Vraag toevoegen" onClick={() => replaceAt(index, { ...block, items: [...block.items, emptyFaqItem()] })} />
              </>
            )}

            {block.type === "buttons" && (
              <>
                <TextArea
                  label="Inleiding (optioneel)"
                  value={block.intro}
                  rows={2}
                  onChange={(intro) => replaceAt(index, { ...block, intro })}
                />
                {block.buttons.map((button, buttonIndex) => (
                  <ButtonFields
                    key={buttonIndex}
                    button={button}
                    position={buttonIndex + 1}
                    onChange={(next) =>
                      replaceAt(index, {
                        ...block,
                        buttons: block.buttons.map((current, currentIndex) => (currentIndex === buttonIndex ? next : current)),
                      })
                    }
                    onRemove={() =>
                      replaceAt(index, {
                        ...block,
                        buttons: block.buttons.filter((_, currentIndex) => currentIndex !== buttonIndex),
                      })
                    }
                  />
                ))}
                <AddRowButton label="Knop toevoegen" onClick={() => replaceAt(index, { ...block, buttons: [...block.buttons, emptyButton()] })} />
              </>
            )}

            {block.type === "locations" && (
              <>
                <TextArea
                  label="Inleiding (optioneel)"
                  value={block.intro}
                  rows={2}
                  onChange={(intro) => replaceAt(index, { ...block, intro })}
                />
                {block.locations.map((location, locationIndex) => (
                  <LocationFields
                    key={locationIndex}
                    location={location}
                    position={locationIndex + 1}
                    onChange={(next) =>
                      replaceAt(index, {
                        ...block,
                        locations: block.locations.map((current, currentIndex) => (currentIndex === locationIndex ? next : current)),
                      })
                    }
                    onRemove={() =>
                      replaceAt(index, {
                        ...block,
                        locations: block.locations.filter((_, currentIndex) => currentIndex !== locationIndex),
                      })
                    }
                  />
                ))}
                <AddRowButton
                  label="Locatie toevoegen"
                  onClick={() => replaceAt(index, { ...block, locations: [...block.locations, emptyLocation()] })}
                />
              </>
            )}

            {block.type === "photos" && (
              <PhotoFields
                images={block.images}
                newFiles={block.newFiles ?? []}
                onRemoveImage={(publicId) =>
                  replaceAt(index, { ...block, images: block.images.filter((current) => current !== publicId) })
                }
                onAddFiles={(files) => replaceAt(index, { ...block, newFiles: [...(block.newFiles ?? []), ...files] })}
                onRemoveFile={(fileIndex) =>
                  replaceAt(index, {
                    ...block,
                    newFiles: (block.newFiles ?? []).filter((_, currentIndex) => currentIndex !== fileIndex),
                  })
                }
              />
            )}
          </div>
        );
      })}

      {/* Blok toevoegen: een tegel per soort, onderaan de lijst — daar komt het
          nieuwe blok ook te staan. */}
      <div className="rounded-xl border-2 border-dashed border-[var(--color-primary-brand)]/25 bg-white p-3">
        <div className="mb-2 flex items-center gap-2 px-1 text-xs font-black uppercase tracking-wider text-[var(--color-primary-brand)]/70">
          <Plus className="h-4 w-4" />
          Blok toevoegen
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {NEWS_BLOCK_TYPES.map((entry) => (
            <button
              key={entry.type}
              type="button"
              title={entry.hint}
              onClick={() => addBlock(entry.type)}
              className="group flex flex-col items-center gap-2 rounded-xl border-2 border-gray-100 bg-gray-50 px-2 py-4 text-gray-500 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary-brand)] hover:bg-white hover:text-[var(--color-primary-brand)] hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors group-hover:bg-[var(--color-accent)]">
                <entry.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider">{entry.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardFields({
  card,
  position,
  onChange,
  onRemove,
}: {
  card: NewsCardItem;
  position: number;
  onChange: (card: NewsCardItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Kaartje {position}</span>
        <SmallButton icon={Trash2} label="Kaartje verwijderen" onClick={onRemove} danger />
      </div>
      <TextInput label="Titel" value={card.title} onChange={(title) => onChange({ ...card, title })} />
      <TextInput
        label="Regel eronder"
        value={card.meta}
        onChange={(meta) => onChange({ ...card, meta })}
        placeholder="bv. 3–4 jaar · zondag 10u00–11u00"
      />
      <TextArea label="Tekst" value={card.body} rows={3} onChange={(body) => onChange({ ...card, body })} />
      <TextArea
        label="Opsomming (één per regel)"
        value={card.bullets.join("\n")}
        rows={3}
        onChange={(value) => onChange({ ...card, bullets: value.split("\n").map((line) => line.trim()).filter(Boolean) })}
        placeholder={"Kristoffelheem, Ham\n€90 per kind"}
      />
    </div>
  );
}

function FaqFields({
  item,
  position,
  onChange,
  onRemove,
}: {
  item: NewsFaqItem;
  position: number;
  onChange: (item: NewsFaqItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Vraag {position}</span>
        <SmallButton icon={Trash2} label="Vraag verwijderen" onClick={onRemove} danger />
      </div>
      <TextInput label="Vraag" value={item.question} onChange={(question) => onChange({ ...item, question })} />
      <TextArea label="Antwoord" value={item.answer} rows={3} onChange={(answer) => onChange({ ...item, answer })} />
    </div>
  );
}

function ButtonFields({
  button,
  position,
  onChange,
  onRemove,
}: {
  button: NewsButtonItem;
  position: number;
  onChange: (button: NewsButtonItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Knop {position}</span>
        <SmallButton icon={Trash2} label="Knop verwijderen" onClick={onRemove} danger />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <TextInput label="Opschrift" value={button.label} onChange={(label) => onChange({ ...button, label })} placeholder="bv. Schrijf in" />
        <TextInput label="Link" value={button.url} onChange={(url) => onChange({ ...button, url })} placeholder="https://... of /contact" />
      </div>
      <div>
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-400">Stijl</label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: "primary", label: "Opvallend (geel)" },
            { value: "secondary", label: "Gedempt" },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...button, style: option.value })}
              className={`rounded-xl border-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                button.style === option.value
                  ? "border-[var(--color-primary-brand)] bg-[var(--color-primary-brand)] text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-[var(--color-primary-brand)]/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocationFields({
  location,
  position,
  onChange,
  onRemove,
}: {
  location: NewsLocationItem;
  position: number;
  onChange: (location: NewsLocationItem) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Locatie {position}</span>
        <SmallButton icon={Trash2} label="Locatie verwijderen" onClick={onRemove} danger />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <TextInput label="Naam" value={location.name} onChange={(name) => onChange({ ...location, name })} placeholder="bv. Kristoffelheem" />
        <TextInput
          label="Adres"
          value={location.address}
          onChange={(address) => onChange({ ...location, address })}
          placeholder="bv. Sportlaan 10a, 3945 Ham"
        />
      </div>
    </div>
  );
}

/**
 * Het fotoblok. Links de foto's die al in Cloudinary staan, daarachter de foto's
 * die nog geüpload moeten worden; die krijgen een streepje eronder zodat het
 * verschil duidelijk is. Uploaden gebeurt pas bij het opslaan van het bericht.
 */
function PhotoFields({
  images,
  newFiles,
  onRemoveImage,
  onAddFiles,
  onRemoveFile,
}: {
  images: string[];
  newFiles: File[];
  onRemoveImage: (publicId: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}) {
  return (
    <div className="space-y-3">
      {(images.length > 0 || newFiles.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {images.map((publicId) => (
            <Thumbnail key={publicId} src={newsRepository.getImageUrl(publicId)} onRemove={() => onRemoveImage(publicId)} />
          ))}
          {newFiles.map((file, fileIndex) => (
            <PendingThumbnail key={`${file.name}-${fileIndex}`} file={file} onRemove={() => onRemoveFile(fileIndex)} />
          ))}
        </div>
      )}

      <label className="relative flex min-h-[90px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-4 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[var(--color-primary-brand)]">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(event) => {
            if (event.target.files) onAddFiles(Array.from(event.target.files));
            // Leegmaken, anders kan dezelfde foto niet nog eens gekozen worden.
            event.target.value = "";
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <Upload className="mb-1 h-6 w-6" />
        <span className="text-sm font-bold">Klik of sleep foto&apos;s</span>
      </label>
    </div>
  );
}

/**
 * Het voorbeeldje van een foto die nog geüpload moet worden. Het adres wordt één
 * keer gemaakt en weer vrijgegeven zodra het voorbeeldje verdwijnt — anders
 * blijft er bij elke toetsaanslag in het formulier een adres achter.
 */
function PendingThumbnail({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;
  return <Thumbnail src={url} pending onRemove={onRemove} />;
}

function Thumbnail({ src, onRemove, pending = false }: { src: string; onRemove: () => void; pending?: boolean }) {
  return (
    <div className="relative">
      <img
        src={src}
        alt=""
        className={`h-16 w-16 rounded-lg border object-cover shadow-sm ${pending ? "border-[var(--color-accent)] border-2" : "border-gray-200"}`}
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Foto verwijderen"
        className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-1 text-white shadow transition-colors hover:bg-red-600"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function SmallButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: typeof ArrowUp;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white" : "bg-white text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-500 transition-colors hover:border-[var(--color-primary-brand)]/40 hover:text-[var(--color-primary-brand)]"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

const fieldClasses =
  "w-full rounded-xl border-2 border-gray-200 bg-white p-3 text-sm font-bold text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--color-primary-brand)]";

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClasses} />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${fieldClasses} resize-none`}
      />
    </div>
  );
}
