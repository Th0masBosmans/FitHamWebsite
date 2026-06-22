"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

/** Shared input style for all admin auth forms. */
export const authInputClass =
  "w-full bg-transparent border-0 border-b-2 border-gray-200 px-0.5 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary-brand)] transition-colors";

/** Shared primary submit-button style (compact pill). */
export const authButtonClass =
  "min-w-[130px] bg-[var(--color-primary-brand)] hover:bg-[var(--color-primary-brand-dark)] disabled:opacity-60 text-white text-sm font-semibold px-8 py-2.5 rounded-full transition-colors flex items-center justify-center";

/** Shared secondary (ghost) pill style — e.g. cancel actions. */
export const authSecondaryButtonClass =
  "min-w-[120px] border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 text-sm font-semibold px-8 py-2.5 rounded-full transition-colors flex items-center justify-center";

type AdminAuthLayoutProps = {
  /** Card heading. */
  title: string;
  /** Supporting line under the heading. */
  subtitle: string;
  /** Top-left escape link. */
  backLink: { href: string; label: string };
  /** Form / card body. */
  children: ReactNode;
}

export function AdminAuthLayout({ title, subtitle, backLink, children }: AdminAuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary-brand-darker)] via-[var(--color-primary-brand)] to-[var(--color-primary-brand-dark)] p-6">
      {/* Atmospheric backdrop: brand glows + faint club pattern */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-[var(--color-secondary-brand)] opacity-25 blur-3xl" />
        <div className="absolute bottom-[-25%] left-[-15%] h-[75%] w-[75%] rounded-full bg-[var(--color-accent)] opacity-15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage: "url('/assets/background-pattern.png')",
            backgroundSize: "480px",
          }}
        />
      </div>

      <Link
        href={backLink.href}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-semibold">{backLink.label}</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="h-1 bg-gradient-to-r from-[var(--color-primary-brand)] via-[var(--color-secondary-brand)] to-[var(--color-accent)]" />
          <div className="p-8 sm:p-10">
            <img src="/FitHamLogo.png" alt="FIT HAM" className="mb-8 h-9 w-auto" />

            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 mb-7 text-sm text-gray-500">{subtitle}</p>

            {children}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">FIT HAM · Beheerdersportaal</p>
      </motion.div>
    </div>
  );
}
