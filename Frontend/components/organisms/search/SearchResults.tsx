"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Home, Users, Calendar, Mail, UserPlus, Camera, X, Award } from "lucide-react";
import { searchableContent } from "@/data/searchData";

type SearchResultsProps = {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  page: string;
  path: string;
  sectionTitle?: string;
  snippet: string;
  matchIndex: number;
}

// Function to get the appropriate icon for each page
function getPageIcon(pageName: string) {
  switch (pageName) {
    case "Home":
      return Home;
    case "Teams":
      return Users;
    case "Galerij":
    case "Foto's":
      return Camera;
    case "Evenementen":
      return Calendar;
    case "Contact":
      return Mail;
    case "Lidmaatschap":
      return UserPlus;
    case "Sponsors":
      return Award;
    default:
      return Home;
  }
}

// Function to highlight the search term in text
function highlightText(text: string, query: string) {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-1 rounded font-bold"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

// Function to create a snippet around the keyword
function createSnippet(text: string, query: string, contextLength: number = 60): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text.substring(0, contextLength * 2) + "...";

  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + query.length + contextLength);

  let snippet = text.substring(start, end);

  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}

export function SearchResults({ searchQuery, isOpen, onClose }: SearchResultsProps) {
  // Search through all content
  const results: SearchResult[] = [];

  if (searchQuery.trim().length >= 2) {
    searchableContent.forEach((page) => {
      page.sections.forEach((section) => {
        const searchText = `${section.title || ""} ${section.content}`.toLowerCase();
        if (searchText.includes(searchQuery.toLowerCase())) {
          const snippet = createSnippet(section.content, searchQuery);
          const matchIndex = searchText.indexOf(searchQuery.toLowerCase());

          results.push({
            page: page.page,
            path: page.path,
            sectionTitle: section.title,
            snippet,
            matchIndex,
          });
        }
      });
    });

    // Sort by relevance (match position)
    results.sort((firstResult, secondResult) => firstResult.matchIndex - secondResult.matchIndex);
  }

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
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white label-large font-bold">
                  Zoekresultaten
                </h3>
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

            {/* Results */}
            <div className="overflow-y-auto flex-1 p-4">
              {searchQuery.trim().length < 2 ? (
                <div className="text-center py-12 text-[var(--color-primary-brand)]/60">
                  <p>Typ minimaal 2 karakters om te zoeken</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-primary-brand)]/60">
                  <p>Geen resultaten gevonden voor &quot;{searchQuery}&quot;</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => {
                    const PageIcon = getPageIcon(result.page);
                    return (
                      <Link
                        key={index}
                        href={result.path}
                        onClick={onClose}
                        className="block bg-white border-2 border-[var(--color-primary-brand)]/10 rounded-xl p-4 hover:border-[var(--color-primary-brand)]/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[var(--color-primary-brand)]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary-brand)] transition-colors">
                            <PageIcon className="w-5 h-5 text-[var(--color-primary-brand)] group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[var(--color-primary-brand)] label-regular font-bold"
                              >
                                Pagina:
                              </span>
                              <span
                                className="text-[var(--color-primary-brand)] label-regular font-semibold"
                              >
                                {result.page}
                              </span>
                            </div>
                            {result.sectionTitle && (
                              <div
                                className="text-[var(--color-primary-brand)]/70 label-small mb-1 font-semibold"
                              >
                                {result.sectionTitle}
                              </div>
                            )}
                            <p className="text-[var(--color-primary-brand)]/80 label-regular leading-relaxed">
                              {highlightText(result.snippet, searchQuery)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
