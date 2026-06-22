"use client";

import { motion } from "motion/react";
import { AccentBar } from "@/components/atoms/AccentBar";

type PageHeadingProps = {
  title: string;
  subtitle: string;
  delay?: number;
}

/**
 * Standard landing-page header used across the section pages (Teams, Events,
 * Contact, Sponsors): a yellow accent bar, the page title, and a subtitle.
 */
export function PageHeading({ title, subtitle, delay = 0.2 }: PageHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <AccentBar className="h-12 w-2" />
        <h1 className="text-white title-page">{title}</h1>
      </div>
      <p className="text-white/90 label-large pl-5">{subtitle}</p>
    </motion.div>
  );
}
