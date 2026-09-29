"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { navLinks, isNavLinkActive, type NavLink } from "./navLinks";

type MobileNavDrawerProps = {
  isOpen: boolean;
  activePath: string;
  onClose: () => void;
}

/** De opmaak van één regel in het uitschuifmenu: actief item blauw, de rest grijs. */
function rowClasses(isActive: boolean): string {
  return `label-large font-black uppercase tracking-tighter py-3 transition-colors ${
    isActive ? "text-[var(--color-primary-brand)]" : "text-gray-400 hover:text-[var(--color-primary-brand)]"
  }`;
}

/** Een menu-item dat ter plaatse openklapt en zijn onderliggende links toont. */
function MobileNavGroup({ link, activePath }: { link: NavLink; activePath: string }) {
  // Sta je al op een van de onderliggende pagina's, dan staat het blok meteen open.
  const [isOpen, setIsOpen] = useState(() => isNavLinkActive(link, activePath));

  return (
    <div className="border-b border-gray-50">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`${rowClasses(isNavLinkActive(link, activePath))} flex w-full cursor-pointer items-center justify-between gap-2 text-left`}
      >
        {link.label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
          <ChevronDown className="h-5 w-5" strokeWidth={3} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 border-l-2 border-[var(--color-accent)] pb-3 pl-3">
              {link.children?.map((child) => (
                <Link
                  key={child.path}
                  href={child.path}
                  className={`label-regular font-bold py-1.5 transition-colors ${
                    activePath === child.path
                      ? "text-[var(--color-primary-brand)]"
                      : "text-gray-400 hover:text-[var(--color-primary-brand)]"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Het menu dat op mobiel vanaf de zijkant inschuift. Links komen uit navLinks. */
export function MobileNavDrawer({ isOpen, activePath, onClose }: MobileNavDrawerProps) {
  return (
    <>
      <motion.div
        className="lg:hidden fixed left-0 top-16 bottom-0 bg-white z-40 overflow-hidden flex flex-col"
        initial={{ width: 0, boxShadow: "none" }}
        animate={{
          // Breed genoeg om ook de onderwerpen van "Onze Club" voluit te tonen.
          width: isOpen ? "78%" : 0,
          boxShadow: isOpen ? "25px 0 50px -12px rgba(0, 0, 0, 0.25)" : "none",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* min-h-0 is nodig: zonder dat krimpt de lijst niet en valt ze door de
            knop onderaan heen zodra alle onderwerpen openstaan. */}
        <nav className="flex min-h-0 flex-1 flex-col py-8 px-5 gap-1 overflow-y-auto">
          {navLinks.map((link) =>
            link.children ? (
              <MobileNavGroup key={link.label} link={link} activePath={activePath} />
            ) : (
              <Link
                key={link.path}
                href={link.path!}
                className={`${rowClasses(activePath === link.path)} border-b border-gray-50`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="mt-auto p-5">
          <Link
            href="/membership"
            className="block w-full bg-[var(--color-primary-brand)] text-white font-black label-regular uppercase tracking-wider py-4 text-center rounded shadow-md hover:bg-[var(--color-primary-brand-darker)] transition-all active:scale-95"
          >
            Lid Worden
          </Link>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
