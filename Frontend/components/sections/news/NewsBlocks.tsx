"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Minus, Plus, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsRepository } from "@/repository/newsRepository";
import type { NewsBlock } from "@/types";

const newsRepository = new NewsRepository();

/**
 * De blokken waaruit een nieuwspagina is opgebouwd. Welke blokken erop staan
 * kiest de beheerder zelf; dit bestand tekent ze.
 *
 * Elk blok volgt hetzelfde stramien: de gele tussentitel van de site, eventueel
 * een korte inleiding, en daaronder witte glazen kaarten op de blauwe
 * achtergrond — net als de rest van de site.
 *
 * Een soort blok bijmaken doe je op twee plekken: hier, en in
 * sections/admin/newsBlocks.ts voor het beheerpaneel.
 */
export function NewsBlockSection({ block }: { block: NewsBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "cards":
      return <CardsBlock block={block} />;
    case "faq":
      return <FaqBlock block={block} />;
    case "photos":
      return <PhotosBlock block={block} />;
    case "buttons":
      return <ButtonsBlock block={block} />;
    case "locations":
      return <LocationsBlock block={block} />;
  }
}

/** De omkadering die elk blok deelt: tussentitel, inleiding en ruimte eronder. */
function BlockShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-12 lg:mt-20"
    >
      {title && <SectionHeading title={title} />}
      {intro && <p className="mb-6 text-white/85 body-regular leading-relaxed lg:body-large">{intro}</p>}
      {children}
    </motion.section>
  );
}

/** Lege regels in een tekstveld worden aparte alinea's. */
function paragraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

function TextBlock({ block }: { block: Extract<NewsBlock, { type: "text" }> }) {
  return (
    <BlockShell title={block.title}>
      <div className="rounded-2xl border-2 border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-md lg:p-10">
        <div className="space-y-4 lg:space-y-5">
          {paragraphs(block.body).map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line text-[var(--color-primary-brand)] body-regular font-medium leading-relaxed lg:body-large">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </BlockShell>
  );
}

function CardsBlock({ block }: { block: Extract<NewsBlock, { type: "cards" }> }) {
  const reduceMotion = useReducedMotion();

  return (
    <BlockShell title={block.title} intro={block.intro}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {block.cards.map((card, index) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: reduceMotion ? 0 : index * 0.1 }}
            className="group relative flex flex-col rounded-2xl border-2 border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl lg:p-7"
          >
            <h3 className="text-[var(--color-primary-brand)] title-section">{card.title}</h3>
            {card.meta && (
              <p className="mt-1.5 text-[var(--color-secondary-brand)] label-regular font-bold">{card.meta}</p>
            )}
            {card.body && (
              <p className="mt-3 text-[var(--color-primary-brand)]/80 body-small font-medium leading-relaxed">
                {card.body}
              </p>
            )}

            {card.bullets.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-[var(--color-primary-brand)]/10 pt-4">
                {card.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="flex gap-2.5 text-[var(--color-primary-brand)]/80 body-small font-semibold">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </motion.article>
        ))}
      </div>
    </BlockShell>
  );
}

function FaqBlock({ block }: { block: Extract<NewsBlock, { type: "faq" }> }) {
  // Eén vraag tegelijk open: zo blijft de lijst overzichtelijk.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <BlockShell title={block.title} intro={block.intro}>
      <div className="flex flex-col gap-3">
        {block.items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`overflow-hidden rounded-2xl border-2 bg-white/90 shadow-lg backdrop-blur-md transition-colors ${
                isOpen ? "border-[var(--color-accent-border)]" : "border-white/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/60 lg:px-7 lg:py-6"
              >
                <span className="text-[var(--color-primary-brand)] label-base font-extrabold lg:label-large">{item.question}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen
                      ? "bg-[var(--color-accent)] text-[var(--color-primary-brand)]"
                      : "bg-[var(--color-primary-brand)]/10 text-[var(--color-primary-brand)]"
                  }`}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="px-5 pb-5 text-[var(--color-primary-brand)]/80 body-small font-medium leading-relaxed lg:px-7 lg:pb-6 lg:body-regular">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BlockShell>
  );
}

/**
 * Een rij actieknoppen. De gele knop is de opvallende (met dezelfde trage halo
 * als de inschrijfknop van een evenement), de gedempte is de glazen ernaast.
 * Een link naar onze eigen site opent gewoon in hetzelfde venster; een link naar
 * elders in een nieuw tabblad.
 */
function ButtonsBlock({ block }: { block: Extract<NewsBlock, { type: "buttons" }> }) {
  const buttons = block.buttons.filter((button) => button.label && button.url);
  if (buttons.length === 0) return null;

  return (
    <BlockShell title={block.title} intro={block.intro}>
      <div className="flex flex-wrap gap-3">
        {buttons.map((button, index) => {
          const isExternal = /^https?:\/\//i.test(button.url);
          const isPrimary = button.style === "primary";
          return (
            <a
              key={index}
              href={button.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 shadow-lg label-small font-extrabold uppercase tracking-wide transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-white ${
                isPrimary
                  ? "cta-glow bg-[var(--color-accent)] text-[var(--color-primary-brand)] hover:bg-white"
                  : "bg-white/15 text-white backdrop-blur-md hover:bg-white/30"
              }`}
            >
              {button.label}
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </a>
          );
        })}
      </div>
    </BlockShell>
  );
}

/**
 * De plekken waar iets doorgaat. Bewust anders dan het adres in de footer (een
 * klein glazen knopje): hier vult een echte kaart de hele tegel, met onderaan
 * een glazen paneel met de naam en het adres.
 *
 * De kaart zelf reageert niet op de muis; de hele tegel is één link naar de
 * routebeschrijving in Google Maps.
 */
function LocationsBlock({ block }: { block: Extract<NewsBlock, { type: "locations" }> }) {
  const reduceMotion = useReducedMotion();
  const locations = block.locations.filter((location) => location.name || location.address);
  if (locations.length === 0) return null;

  const single = locations.length === 1;

  return (
    <BlockShell title={block.title} intro={block.intro}>
      <div className={single ? "" : "grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6"}>
        {locations.map((location, index) => {
          const query = encodeURIComponent([location.name, location.address].filter(Boolean).join(", "));
          return (
            <motion.a
              key={index}
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: reduceMotion ? 0 : index * 0.1 }}
              className={`group relative block overflow-hidden rounded-2xl border border-white/30 bg-[var(--color-primary-brand-darker)] shadow-xl transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] ${
                single ? "aspect-4/5 sm:aspect-video" : "aspect-4/5 sm:aspect-4/3"
              }`}
            >
              {/* Google zet linksboven een kaartje met de plaatsnaam en onderaan
                  een balk met de voorwaarden. De kaart is daarom boven en onder
                  even ver buiten de tegel getrokken: dan valt dat allebei weg en
                  blijft de speld toch in het midden. */}
              <iframe
                src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
                title={`Kaart van ${location.name || location.address}`}
                loading="lazy"
                tabIndex={-1}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-[180px] h-[calc(100%+360px)] w-full scale-110 border-0 transition-transform duration-700 ease-out group-hover:scale-100"
              />

              {/* Een blauwe waas over de kaart, zodat ze bij de site past, en
                  onderaan een donker verloop voor het leesbare paneel */}
              <div className="pointer-events-none absolute inset-0 bg-[var(--color-primary-brand)]/15 mix-blend-multiply" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[var(--color-primary-brand-darker)]/90 via-[var(--color-primary-brand-darker)]/40 to-transparent" />


              <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl border border-white/20 bg-white/15 p-3 shadow-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:gap-4 sm:p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-primary-brand)] shadow-md transition-transform group-hover:-translate-y-0.5">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  {location.name && <p className="truncate text-white label-large font-extrabold">{location.name}</p>}
                  {location.address && <p className="truncate text-white/80 label-small font-semibold">{location.address}</p>}
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </BlockShell>
  );
}

function PhotosBlock({ block }: { block: Extract<NewsBlock, { type: "photos" }> }) {
  // De aangeklikte foto, groot over de pagina. Null = geen foto open.
  const [zoomed, setZoomed] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  if (block.images.length === 0) return null;

  return (
    <BlockShell title={block.title}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
        {block.images.map((publicId, index) => (
          <motion.button
            key={publicId}
            type="button"
            onClick={() => setZoomed(publicId)}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: reduceMotion ? 0 : (index % 6) * 0.06 }}
            className="group aspect-4/3 overflow-hidden rounded-2xl border border-white/30 shadow-xl focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <img
              src={newsRepository.getImageUrl(publicId)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </motion.button>
        ))}
      </div>

      {zoomed && (
        <div
          onClick={() => setZoomed(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <button
            type="button"
            aria-label="Sluiten"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={newsRepository.getImageUrl(zoomed)}
            alt=""
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </BlockShell>
  );
}
