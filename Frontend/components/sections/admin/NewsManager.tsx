"use client";

import { useEffect, useState } from "react";
import { Newspaper, Plus } from "lucide-react";
import { NewsRepository, articleDate, collectBlockImages, slugify, type NewsArticle } from "@/repository/newsRepository";
import { formatEventDate } from "@/lib/eventFormat";
import { ActionButton, ImageUploadZone, InputField, ModalWrapper, SubmitButton } from "./AdminControls";
import { ExpandableListItem } from "./ExpandableListItem";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { extractFormString } from "./adminHelpers";
import { NewsBlocksEditor } from "./NewsBlocksEditor";
import { newsBlockLabel, toStoredBlock, type NewsBlockDraft } from "./newsBlocks";
import { REGISTRATION_OPTIONS, registrationOption } from "@/components/sections/events/EventRegistrationButton";

const newsRepository = new NewsRepository();

/**
 * Het nieuwsblok in tabblad "Home": berichten met een eigen pagina op
 * /nieuws/<webadres>.
 *
 * Werkt zoals het tabblad Evenementen, met één verschil: onder de gewone velden
 * stel je met blokken de inhoud van de pagina samen (zie NewsBlocksEditor). De
 * foto's uit die blokken gaan naar Cloudinary, en wel pas hier bij het opslaan —
 * zo blijft er niets hangen als de beheerder halverwege bedenkt dat het toch
 * anders moet.
 */
export function NewsManager({ active }: { active: boolean }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; item?: NewsArticle } | null>(null);
  const [blocks, setBlocks] = useState<NewsBlockDraft[]>([]);
  const [slug, setSlug] = useState("");
  // Zolang de beheerder het webadres niet zelf aanpast, volgt het de titel.
  const [slugTouched, setSlugTouched] = useState(false);
  const [hasCta, setHasCta] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    newsRepository.fetchArticles().then(setArticles);
  }, []);

  useEffect(() => {
    if (!active) setExpandedId(null);
  }, [active]);

  // Het venster opent: alle velden die niet uit het formulier komen goed zetten.
  useEffect(() => {
    if (!modal?.isOpen) return;
    setBlocks(modal.item?.blocks ?? []);
    setSlug(modal.item?.slug ?? "");
    setSlugTouched(Boolean(modal.item));
    setHasCta(Boolean(modal.item?.cta_url));
  }, [modal]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = extractFormString(formData, "title");
    const finalSlug = slugify(slug || title);
    if (!finalSlug) {
      alert("Vul een webadres in.");
      return;
    }

    // De hoofdfoto zit in een eigen vak; de fotoblokken hebben er ook één, dus
    // zoeken we hem gericht op in plaats van het eerste bestandsveld te pakken.
    const coverInput = form.querySelector('[data-cover] input[type="file"]') as HTMLInputElement | null;
    const coverFile = coverInput?.files?.[0];

    setSaving(true);
    try {
      const image = coverFile ? await newsRepository.uploadImage(coverFile) : (modal?.item?.image ?? null);

      // De foto's die de beheerder in de fotoblokken koos, staan nog op de
      // computer. Die gaan nu naar Cloudinary en komen achteraan het blok.
      const storedBlocks = await Promise.all(
        blocks.map(async (block) => {
          if (block.type !== "photos" || !block.newFiles?.length) return toStoredBlock(block);
          const uploaded = await Promise.all(block.newFiles.map((file) => newsRepository.uploadImage(file)));
          return toStoredBlock({ ...block, images: [...block.images, ...uploaded] });
        })
      );

      const fields = {
        slug: finalSlug,
        title,
        subtitle: extractFormString(formData, "subtitle").trim() || null,
        intro: extractFormString(formData, "intro"),
        image,
        blocks: storedBlocks,
        highlighted: formData.get("highlighted") === "on",
        // Vinkje uit betekent: een eerder ingevulde link ook echt wissen.
        cta_url: hasCta ? extractFormString(formData, "cta_url").trim() || null : null,
        cta_label: hasCta ? extractFormString(formData, "cta_label").trim() || null : null,
      };

      const previous = modal?.item;
      const saved = previous?.id != null
        ? await newsRepository.updateArticle(previous.id, fields)
        : await newsRepository.postArticle(fields);

      setArticles((current) =>
        previous?.id != null
          ? current.map((article) => (article.id === saved.id ? saved : article))
          : [saved, ...current]
      );

      // Pas nu de foto's opruimen die er niet meer bij horen: de vervangen
      // hoofdfoto, en alles wat uit de fotoblokken gehaald is.
      if (previous) {
        const keep = new Set([saved.image, ...collectBlockImages(saved.blocks)].filter(Boolean) as string[]);
        const orphans = [previous.image, ...collectBlockImages(previous.blocks)]
          .filter((publicId): publicId is string => Boolean(publicId) && !keep.has(publicId!));
        await Promise.all(
          orphans.map((publicId) =>
            newsRepository.deleteImage(publicId).catch((error) => console.error("Cloudinary cleanup failed:", error))
          )
        );
      }

      setModal(null);
    } catch (error) {
      alert(`Opslaan mislukt: ${error instanceof Error ? error.message : "onbekende fout"}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    const article = articles.find((item) => item.id === pendingDeleteId);
    if (!article) return;
    newsRepository
      .deleteArticle(article)
      .then(() => setArticles((current) => current.filter((item) => item.id !== article.id)))
      .catch((error) => alert(`Kon het nieuwsbericht niet verwijderen: ${error.message}`));
    setPendingDeleteId(null);
  };

  if (!active) return null;

  return (
    <section className="space-y-4 pt-6 lg:pt-10">
      {/* Eigen kop, want dit blok deelt het tabblad met de foto's van de homepagina */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-brand)] text-white shadow-sm">
            <Newspaper className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-wider text-[var(--color-primary-brand)] lg:text-xl">Nieuws</h3>
          <span className="rounded-full bg-[var(--color-primary-brand)]/10 px-2.5 py-0.5 text-xs font-black text-[var(--color-primary-brand)]">
            {articles.length}
          </span>
        </div>
        <ActionButton onClick={() => setModal({ isOpen: true })} icon={Plus} label="Nieuw Bericht" labelShort="Bericht" primary />
      </div>

      {articles.map((article) => {
        const articleId = String(article.id);
        const { date, edited } = articleDate(article);
        return (
          <ExpandableListItem
            key={articleId}
            title={article.title}
            subtitle={`${edited ? "Bijgewerkt" : "Gepubliceerd"} ${formatEventDate(date)}`}
            icon={Newspaper}
            image={article.image ? newsRepository.getImageUrl(article.image) : ""}
            isExpanded={expandedId === articleId}
            onToggle={() => setExpandedId((current) => (current === articleId ? null : articleId))}
            onEdit={() => setModal({ isOpen: true, item: article })}
            onDelete={() => setPendingDeleteId(article.id!)}
            details={[
              { label: "Webadres", value: `/nieuws/${article.slug}` },
              {
                label: "Homepagina",
                value: article.highlighted ? (
                  <span className="font-black text-[var(--color-primary-brand)]">Uitgelicht</span>
                ) : (
                  <span className="text-gray-400">Niet uitgelicht</span>
                ),
              },
              {
                label: "Inhoud",
                value: article.blocks.length
                  ? article.blocks.map((block) => newsBlockLabel(block.type)).join(" · ")
                  : <span className="text-gray-400">Nog geen blokken</span>,
              },
              {
                label: "Actieknop",
                value: article.cta_url ? registrationOption(article.cta_label).label : <span className="text-gray-400">Geen</span>,
              },
            ]}
            description={article.intro}
          />
        );
      })}
      {/* De grote "+"-tegel onderaan de lijst: daar komt het nieuwe bericht ook te staan */}
      <button
        type="button"
        onClick={() => setModal({ isOpen: true })}
        className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-primary-brand)]/25 bg-white/60 p-6 text-[var(--color-primary-brand)]/70 transition-all hover:border-[var(--color-primary-brand)] hover:bg-[var(--color-primary-brand)]/5 hover:text-[var(--color-primary-brand)] lg:p-8"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] shadow-sm transition-transform group-hover:scale-110">
          <Plus className="h-5 w-5" />
        </span>
        <span className="text-sm font-black uppercase tracking-wider">Nieuw bericht</span>
      </button>

      {modal && (
        <ModalWrapper title={modal.item ? "Bericht Bewerken" : "Nieuw Bericht"} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Titel</label>
              <input
                name="title"
                defaultValue={modal.item?.title}
                required
                onChange={(event) => {
                  if (!slugTouched) setSlug(slugify(event.target.value));
                }}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 p-3.5 text-sm font-bold text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[var(--color-primary-brand)] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Webadres</label>
              <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 px-3.5 focus-within:border-[var(--color-primary-brand)] focus-within:bg-white">
                <span className="shrink-0 text-sm font-bold text-gray-400">/nieuws/</span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  onBlur={(event) => setSlug(slugify(event.target.value))}
                  required
                  className="w-full bg-transparent py-3.5 text-sm font-bold text-gray-800 outline-none"
                />
              </div>
              <p className="mt-1.5 text-xs font-bold text-gray-400">
                Dit wordt het adres van de pagina. Wijzig je het later, dan werken oude links niet meer.
              </p>
            </div>

            <InputField label="Ondertitel (optioneel)" name="subtitle" defaultValue={modal.item?.subtitle ?? ""} />
            <InputField label="Inleiding" name="intro" defaultValue={modal.item?.intro} required isTextarea />

            <div data-cover>
              <ImageUploadZone
                label="Hoofdfoto (optioneel)"
                name="image"
                defaultValue={modal.item?.image ? newsRepository.getImageUrl(modal.item.image) : undefined}
                required={false}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                name="highlighted"
                defaultChecked={modal.item?.highlighted ?? true}
                className="h-5 w-5 accent-[var(--color-primary-brand)]"
              />
              <span className="text-sm font-black uppercase tracking-wider text-gray-700">Tonen op de homepagina</span>
            </label>

            {/* Dezelfde actieknop als bij een evenement, met dezelfde twee
                opschriften — zo zien de knoppen er overal op de site gelijk uit. */}
            <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={hasCta}
                  onChange={(event) => setHasCta(event.target.checked)}
                  className="h-5 w-5 accent-[var(--color-primary-brand)]"
                />
                <span className="text-sm font-black uppercase tracking-wider text-gray-700">Actieknop</span>
              </label>

              {hasCta && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500">
                    De knop staat bovenaan de nieuwspagina en opent de link in een nieuw tabblad.
                  </p>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Opschrift op de knop</label>
                    <div className="flex flex-wrap gap-2">
                      {REGISTRATION_OPTIONS.map((option, optionIndex) => (
                        <label key={option.label} className="cursor-pointer">
                          <input
                            type="radio"
                            name="cta_label"
                            value={option.label}
                            defaultChecked={
                              modal.item?.cta_label ? modal.item.cta_label === option.label : optionIndex === 0
                            }
                            className="peer sr-only"
                          />
                          <span className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-500 transition-colors hover:border-[var(--color-primary-brand)]/40 peer-checked:border-[var(--color-primary-brand)] peer-checked:bg-[var(--color-primary-brand)] peer-checked:text-white">
                            <option.icon className="h-4 w-4 shrink-0" />
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <InputField label="Link" name="cta_url" type="url" defaultValue={modal.item?.cta_url ?? ""} placeholder="https://..." required />
                </div>
              )}
            </div>

            <NewsBlocksEditor blocks={blocks} onChange={setBlocks} />

            <SubmitButton label={saving ? "Bezig met opslaan..." : modal.item ? "Opslaan" : "Toevoegen"} disabled={saving} />
          </form>
        </ModalWrapper>
      )}

      {pendingDeleteId != null && <DeleteConfirmModal onCancel={() => setPendingDeleteId(null)} onConfirm={confirmDelete} />}
    </section>
  );
}
