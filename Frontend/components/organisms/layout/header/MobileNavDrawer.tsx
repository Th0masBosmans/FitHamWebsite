"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { navLinks } from "./navLinks";

type MobileNavDrawerProps = {
  isOpen: boolean;
  activePath: string;
  onClose: () => void;
}

/** Slide-in navigation drawer and its backdrop, shown below 1024px. */
export function MobileNavDrawer({ isOpen, activePath, onClose }: MobileNavDrawerProps) {
  return (
    <>
      <motion.div
        className="lg:hidden fixed left-0 top-16 bottom-0 bg-white z-40 overflow-hidden flex flex-col"
        initial={{ width: 0, boxShadow: "none" }}
        animate={{
          width: isOpen ? "60%" : 0,
          boxShadow: isOpen ? "25px 0 50px -12px rgba(0, 0, 0, 0.25)" : "none",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="flex flex-col py-8 px-5 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`label-large font-black uppercase tracking-tighter py-3 border-b border-gray-50 transition-colors ${
                activePath === link.path
                  ? "text-[var(--color-primary-brand)]"
                  : "text-gray-400 hover:text-[var(--color-primary-brand)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
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
