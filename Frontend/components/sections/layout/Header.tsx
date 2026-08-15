"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchResults } from "@/components/sections/search/SearchResults";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { DesktopNav } from "./header/DesktopNav";
import { MobileNavDrawer } from "./header/MobileNavDrawer";
import { HeaderSearchMobileField, HeaderSearchToggle } from "./header/HeaderSearch";
import { MIN_QUERY_LENGTH } from "@/lib/siteSearch";

// De balk bovenaan elke publieke pagina (ingehangen in pages/_app).
// Bestaat uit: het logo links (public/FitHamLogo.png), de schuine blauwe vlak
// rechts met daarin de navigatie (header/navLinks), het zoekveld
// (header/HeaderSearch) en op mobiel de hamburgerknop naar header/MobileNavDrawer.

/** Hoe breed de blauwe schuine vlak is, afhankelijk van scherm en of het zoekveld open staat. */
function panelWidth(searchOpen: boolean, isDesktop: boolean): string {
  if (searchOpen && !isDesktop) return "calc(60% + 40px)";
  return isDesktop ? "calc(78% + 40px)" : "calc(40% + 40px)";
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const isDesktop = useIsDesktop();
  const { pathname } = useRouter();

  // Naar een andere pagina navigeren sluit alles wat openstond.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setShowResults(false);
  }, [pathname]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setShowResults(value.trim().length >= MIN_QUERY_LENGTH);
  };

  const submitSearch = () => {
    if (searchValue.trim().length >= MIN_QUERY_LENGTH) setShowResults(true);
  };

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
    setMenuOpen(false);
  };

  const closeResults = () => {
    setShowResults(false);
    setSearchOpen(false);
    setSearchValue("");
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 bg-white overflow-hidden shadow-sm">
        <div className="relative h-full w-full flex items-center justify-between">
          {/* Logo op de witte achtergrond links */}
          <div className="flex items-center h-full px-4 relative z-20">
            <Link href="/" className="flex items-center flex-shrink-0 h-full py-1">
              <img src="/FitHamLogo.png" alt="Fit Ham" className="h-full w-auto object-contain" />
            </Link>
          </div>

          {/* Het schuin afgesneden blauwe vlak rechts */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] flex justify-end"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 40px 100%)" }}
            initial={false}
            animate={{ width: panelWidth(searchOpen, isDesktop) }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          >
            <div className="relative flex items-center w-full max-w-full gap-1 lg:gap-2 h-full pl-[48px] pr-4">
              <DesktopNav activePath={pathname} />

              {/* Staat bewust hier en niet bij de knoppen: alleen als broer van het
                  knoppenblok kan dit veld zich over de balk uitrekken. */}
              <HeaderSearchMobileField
                value={searchValue}
                isOpen={searchOpen}
                isDesktop={isDesktop}
                onChange={handleSearchChange}
                onSubmit={submitSearch}
              />

              <div className="flex items-center gap-2 ml-auto relative">
                <HeaderSearchToggle
                  value={searchValue}
                  isOpen={searchOpen}
                  onChange={handleSearchChange}
                  onSubmit={submitSearch}
                  onToggle={toggleSearch}
                />

                {/* Hamburgerknop, alleen op mobiel */}
                <button
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                    setSearchOpen(false);
                  }}
                  aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
                  className="lg:hidden text-white p-1.5 focus:outline-none hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={menuOpen ? "close" : "menu"}
                      initial={{ rotate: menuOpen ? -90 : 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: menuOpen ? 90 : -90, opacity: 0 }}
                    >
                      {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" strokeWidth={2.5} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <MobileNavDrawer isOpen={menuOpen} activePath={pathname} onClose={() => setMenuOpen(false)} />

      <SearchResults searchQuery={searchValue} isOpen={showResults} onClose={closeResults} />
    </>
  );
}
