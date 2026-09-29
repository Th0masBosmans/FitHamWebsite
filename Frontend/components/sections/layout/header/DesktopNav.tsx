"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { navLinks, isNavLinkActive, type NavLink } from "./navLinks";

/** De opmaak van één link in de balk: actief item geel, de rest wit. */
function linkClasses(isActive: boolean): string {
  return `px-3 py-1.5 label-regular font-bold uppercase tracking-tight transition-all rounded whitespace-nowrap ${
    isActive
      ? "text-[var(--color-accent)] bg-white/10"
      : "text-white hover:text-[var(--color-accent)] hover:bg-white/10"
  }`;
}

/** De breedte van het uitklappaneel in pixels; nodig om het te kunnen centreren. */
const MENU_WIDTH = 520;

/**
 * Een menu-item dat openklapt bij hover of focus.
 *
 * Het uitklapmenu hangt bewust rechtstreeks aan de body (een portal) en niet aan
 * de balk: het blauwe vlak van de header is schuin afgesneden met clip-path, en
 * dat knipt alles weg wat erbuiten valt - ook een menu dat eronder hoort te
 * hangen. Waar het menu moet staan, meten we daarom zelf op bij het openen.
 */
function DesktopNavMenu({ link, activePath }: { link: NavLink; activePath: string }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Het paneel staat gecentreerd onder de knop, maar schuift op als het anders
    // buiten beeld zou vallen.
    const centered = rect.left + rect.width / 2 - MENU_WIDTH / 2;
    const left = Math.min(Math.max(centered, 16), window.innerWidth - MENU_WIDTH - 16);
    // Onder de hele header hangen, niet net onder de knop: anders valt de
    // bovenrand van het paneel achter de blauwe balk.
    const headerBottom = triggerRef.current?.closest("header")?.getBoundingClientRect().bottom ?? rect.bottom;
    setAnchor({ left, top: headerBottom + 10 });
  };

  // Tussen de knop en het menu zit een stukje lucht. Even wachten met sluiten
  // zodat de muis die afstand kan overbruggen zonder dat het menu wegvalt.
  const close = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setAnchor(null), 150);
  };

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const isOpen = anchor !== null;

  return (
    <div className="relative" onMouseEnter={open} onMouseLeave={close} onFocus={open} onBlur={close}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? setAnchor(null) : open())}
        className={`${linkClasses(isNavLinkActive(link, activePath))} inline-flex cursor-pointer items-center gap-1`}
      >
        {link.label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
          <ChevronDown className="h-4 w-4" strokeWidth={3} />
        </motion.span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onMouseEnter={open}
                onMouseLeave={close}
                style={{ position: "fixed", left: anchor.left, top: anchor.top, width: MENU_WIDTH }}
                className="z-50 origin-top overflow-hidden rounded-2xl bg-white/95 p-2 shadow-[0_24px_60px_-12px_rgba(0,45,107,0.35)] ring-1 ring-[var(--color-primary-brand)]/10 backdrop-blur-xl"
              >
                {/* Zachte gloed in de merkkleuren achter de links, voor wat diepte. */}
                <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[var(--color-secondary-brand)]/20 blur-3xl" />
                <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-[var(--color-primary-brand)]/10 blur-3xl" />

                <motion.div
                  initial="hidden"
                  animate="shown"
                  variants={{ shown: { transition: { staggerChildren: 0.03 } } }}
                  className="relative grid grid-cols-2 gap-1"
                >
                  {link.children?.map((child) => {
                    const isActive = activePath === child.path;
                    return (
                      <motion.div
                        key={child.path}
                        variants={{ hidden: { opacity: 0, y: 6 }, shown: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Link
                          href={child.path}
                          className={`group flex items-stretch gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                            isActive ? "bg-[var(--color-primary-brand)]/[0.07]" : "hover:bg-[var(--color-primary-brand)]/5"
                          }`}
                        >
                          {/* Het gele streepje van de paginatitels: vol bij de pagina waar je
                              bent, groeit bij hover open voor de andere. */}
                          <span
                            aria-hidden
                            className={`w-1 shrink-0 origin-top rounded-full bg-[var(--color-accent)] transition-transform duration-200 ${
                              isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                            }`}
                          />
                          <span className="min-w-0">
                            <span className="block label-small font-black uppercase tracking-tight text-[var(--color-primary-brand-darker)]">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="mt-0.5 block label-small text-gray-500">
                                {child.description}
                              </span>
                            )}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

/** De menulinks in de blauwe balk, alleen op brede schermen. Links komen uit navLinks. */
export function DesktopNav({ activePath }: { activePath: string }) {
  return (
    <nav className="hidden lg:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-[65%]">
      {navLinks.map((link) =>
        link.children ? (
          <DesktopNavMenu key={link.label} link={link} activePath={activePath} />
        ) : (
          <Link key={link.path} href={link.path!} className={linkClasses(activePath === link.path)}>
            {link.label}
          </Link>
        )
      )}
      <Link
        href="/membership"
        className="px-3 py-1.5 bg-[var(--color-primary-brand)] text-white label-small font-black uppercase tracking-wide rounded hover:bg-[var(--color-primary-brand-darker)] transition-all whitespace-nowrap shadow-sm hover:shadow-md"
      >
        Lid Worden
      </Link>
    </nav>
  );
}
