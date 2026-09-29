"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const PROEFTRAINING_MESSAGE = "Ik wil me graag aanmelden voor een gratis proeftraining!";
const proeftrainingHref = `/contact?message=${encodeURIComponent(PROEFTRAINING_MESSAGE)}#contact-form`;

export function MembershipInfo() {
  return (
    <div className="mt-12 px-6 pb-8 max-w-md lg:max-w-4xl mx-auto space-y-6">
      <Link href={proeftrainingHref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] rounded-2xl p-6 shadow-2xl transform hover:scale-[1.02] transition-all border-2 border-[var(--color-secondary-brand)]/50 relative overflow-hidden group text-center"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100"></div>

          <div className="relative z-10 flex flex-col items-center">
            <h4 className="text-white title-section font-black italic uppercase mb-2">Gratis Proeftraining</h4>
            <p className="text-white/90 font-medium label-regular leading-relaxed mb-6 max-w-[280px] lg:max-w-md">
              Nog niet zeker, kom gerust al eens proef trainen om te zien of Fit Ham jouw club wordt! Je kan tot 3 maal toe gratis proef trainen!
            </p>
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-[var(--color-primary-brand)] px-6 py-3 rounded-xl shadow-lg group-hover:bg-white group-hover:text-[var(--color-primary-brand)] transition-colors font-black uppercase tracking-wider label-regular">
              Aanvragen via Contact
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
