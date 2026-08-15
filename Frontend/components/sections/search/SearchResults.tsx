"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Home, Users, Calendar, Mail, UserPlus, Camera, X, Award } from "lucide-react";
import { MIN_QUERY_LENGTH, searchSite, splitOnQuery } from "@/lib/siteSearch";
import type { SearchResult } from "@/types";

// Het uitklappende zoekresultaten-paneel onder de header. De header
// (sections/layout/Header) geeft door wat er getypt is; het zoeken zelf gebeurt
// in lib/siteSearch, op de teksten uit data/searchData.ts.

type SearchResultsProps = {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
};

/** Icoontje per pagina, zodat je in de resultatenlijst meteen ziet waar iets staat. */
const PAGE_ICONS: Record<string, typeof Home> = {
  Home: Home,
  Teams: Users,
  Galerij: Camera,
  "Foto's": Camera,
  Evenementen: Calendar,
  Contact: Mail,
  Lidmaatschap: UserPlus,
  Sponsors: Award,
};

export function SearchResults({ searchQuery, isOpen, onClose }: SearchResultsProps) {
  const results = searchSite(searchQuery);
  const tooShort = searchQuery.trim().length < MIN_QUERY_LENGTH;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white max-w-md mx-auto mt-4 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            // Klik binnen het paneel mag het paneel niet sluiten.
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white label-large font-bold">Zoekresultaten</h3>
                {searchQuery && (
                  <p className="text-white/80 label-regular">voor &quot;{searchQuery}&quot;</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {tooShort ? (
                <EmptyMessage>Typ minimaal {MIN_QUERY_LENGTH} karakters om te zoeken</EmptyMessage>
              ) : results.length === 0 ? (
                <EmptyMessage>Geen resultaten gevonden voor &quot;{searchQuery}&quot;</EmptyMessage>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <ResultCard
                      key={`${result.path}-${index}`}
                      result={result}
                      query={searchQuery}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-12 text-[var(--color-primary-brand)]/60">
      <p>{children}</p>
    </div>
  );
}

/** Eén treffer: icoontje van de pagina + het stukje tekst met de zoekterm geel gemarkeerd. */
function ResultCard({
  result,
  query,
  onNavigate,
}: {
  result: SearchResult;
  query: string;
  onNavigate: () => void;
}) {
  const PageIcon = PAGE_ICONS[result.page] ?? Home;

  return (
    <Link
      href={result.path}
      onClick={onNavigate}
      className="block bg-white border-2 border-[var(--color-primary-brand)]/10 rounded-xl p-4 hover:border-[var(--color-primary-brand)]/30 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[var(--color-primary-brand)]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary-brand)] transition-colors">
          <PageIcon className="w-5 h-5 text-[var(--color-primary-brand)] group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[var(--color-primary-brand)] label-regular font-bold">Pagina:</span>
            <span className="text-[var(--color-primary-brand)] label-regular font-semibold">{result.page}</span>
          </div>
          {result.sectionTitle && (
            <div className="text-[var(--color-primary-brand)]/70 label-small mb-1 font-semibold">
              {result.sectionTitle}
            </div>
          )}
          <p className="text-[var(--color-primary-brand)]/80 label-regular leading-relaxed">
            {splitOnQuery(result.snippet, query).map((part, index) =>
              part.isMatch ? (
                <mark
                  key={index}
                  className="bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-1 rounded font-bold"
                >
                  {part.text}
                </mark>
              ) : (
                <span key={index}>{part.text}</span>
              )
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
