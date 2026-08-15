"use client";

import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";

// Het zoekveld in de header, in twee stukken omdat ze op een andere plek in de
// balk moeten staan:
//
//   HeaderSearchMobileField  → staat los in de balk en duwt de knoppen opzij
//                              (daarvoor moet het een broer van het knoppenblok
//                              zijn, anders rekt het niet uit)
//   HeaderSearchToggle       → hoort bij de knoppen rechts; bevat het
//                              vergrootglas en het desktopveld dat ernaast zweeft
//
// Wat er getypt wordt gaat naar sections/search/SearchResults.

type SharedProps = {
  value: string;
  onChange: (value: string) => void;
  /** Enter indrukken toont de resultaten meteen. */
  onSubmit: () => void;
};

const inputBase = "bg-transparent text-white outline-none label-regular w-full";
const springTransition = { type: "spring", stiffness: 350, damping: 32 } as const;

function handleKeyDown(onSubmit: () => void) {
  return (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onSubmit();
  };
}

/** Het mobiele zoekveld: schuift open over de breedte van de balk. */
export function HeaderSearchMobileField({
  value,
  isOpen,
  isDesktop,
  onChange,
  onSubmit,
}: SharedProps & { isOpen: boolean; isDesktop: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && !isDesktop && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={springTransition}
          className="overflow-hidden flex items-center pr-2 lg:hidden"
        >
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown(onSubmit)}
            placeholder="Zoeken..."
            autoFocus
            className={`${inputBase} placeholder:text-white/40 border-b border-white/30 px-1 py-0.5 min-w-[100px]`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Het vergrootglas (dat een kruisje wordt) plus het desktopveld dat er links van
 * uitklapt. Het desktopveld zweeft absoluut, dus dit hoort in een blok met
 * `relative`.
 */
export function HeaderSearchToggle({
  value,
  isOpen,
  onChange,
  onSubmit,
  onToggle,
}: SharedProps & { isOpen: boolean; onToggle: () => void }) {
  return (
    <>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={springTransition}
            className="hidden lg:flex overflow-hidden items-center bg-white/20 backdrop-blur-md rounded-lg border border-white/30 absolute right-12 top-1/2 -translate-y-1/2"
          >
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown(onSubmit)}
              placeholder="Zoeken..."
              autoFocus
              className={`${inputBase} placeholder:text-white/60 px-3 py-1.5`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onToggle}
        aria-label={isOpen ? "Zoeken sluiten" : "Zoeken"}
        className="text-white p-1 hover:text-[var(--color-accent)] transition-colors flex-shrink-0 relative z-10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "search"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" strokeWidth={2.5} />}
          </motion.div>
        </AnimatePresence>
      </button>
    </>
  );
}
