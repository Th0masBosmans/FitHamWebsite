"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchResults } from "@/components/organisms/search/SearchResults";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { DesktopNav } from "./header/DesktopNav";
import { MobileNavDrawer } from "./header/MobileNavDrawer";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const isDesktop = useIsDesktop();
  const { pathname } = useRouter();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setShowResults(false);
  }, [pathname]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    setShowResults(value.trim().length >= 2);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchValue.trim().length >= 2) {
      setShowResults(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 bg-white overflow-hidden shadow-sm">
        <div className="relative h-full w-full flex items-center justify-between">
          {/* Left Side: Logo Area - White Background */}
          <div className="flex items-center h-full px-4 relative z-20">
            <Link href="/" className="flex items-center flex-shrink-0 h-full py-1">
              <img
                src="/FitHamLogo.png"
                alt="FIT HAM Logo"
                className="h-full w-auto object-contain"
              />
            </Link>
          </div>

          {/* Right Side: Dark Blue Slanted Segment */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] flex justify-end"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 40px 100%)",
            }}
            initial={false}
            animate={{
              width:
                searchOpen && !isDesktop
                  ? "calc(60% + 40px)"
                  : isDesktop
                    ? "calc(78% + 40px)"
                    : "calc(40% + 40px)",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          >
            <div className="relative flex items-center w-full max-w-full gap-1 lg:gap-2 h-full pl-[48px] pr-4">
              <DesktopNav activePath={pathname} />

              {/* Mobile search input - expands left */}
              <AnimatePresence initial={false}>
                {searchOpen && !isDesktop && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                    className="overflow-hidden flex items-center pr-2 lg:hidden"
                  >
                    <input
                      type="text"
                      value={searchValue}
                      onChange={handleSearchChange}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="Zoeken..."
                      autoFocus
                      className="bg-transparent text-white placeholder:text-white/40 border-b border-white/30 px-1 py-0.5 outline-none label-regular w-full min-w-[100px]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right side controls */}
              <div className="flex items-center gap-2 ml-auto relative">
                {/* Desktop search input - absolute positioned */}
                <AnimatePresence initial={false}>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 180, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 32 }}
                      className="hidden lg:flex overflow-hidden items-center bg-white/20 backdrop-blur-md rounded-lg border border-white/30 absolute right-12 top-1/2 -translate-y-1/2"
                    >
                      <input
                        type="text"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyPress={handleSearchKeyPress}
                        placeholder="Zoeken..."
                        autoFocus
                        className="bg-transparent text-white placeholder:text-white/60 px-3 py-1.5 outline-none label-regular w-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search Toggle */}
                <button
                  onClick={() => {
                    if (searchOpen) {
                      setSearchOpen(false);
                    } else {
                      setSearchOpen(true);
                      setMenuOpen(false);
                    }
                  }}
                  className="text-white p-1 hover:text-[var(--color-accent)] transition-colors flex-shrink-0 relative z-10"
                >
                  <AnimatePresence mode="wait">
                    {searchOpen ? (
                      <motion.div
                        key="x"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="search"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Search className="w-5 h-5" strokeWidth={2.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Hamburger - Only on mobile */}
                <button
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                    setSearchOpen(false);
                  }}
                  className="lg:hidden text-white p-1.5 focus:outline-none hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
                >
                  <AnimatePresence mode="wait">
                    {menuOpen ? (
                      <motion.div
                        key="x"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                      >
                        <X className="w-7 h-7" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                      >
                        <Menu className="w-7 h-7" strokeWidth={2.5} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <MobileNavDrawer isOpen={menuOpen} activePath={pathname} onClose={() => setMenuOpen(false)} />

      {/* Search Results */}
      <SearchResults
        searchQuery={searchValue}
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          setSearchOpen(false);
          setSearchValue("");
        }}
      />
    </>
  );
}
