"use client";

import { useRouter } from "next/router";
import { motion } from "motion/react";
import { PageHeading } from "@/components/molecules/PageHeading";
import { ContactForm } from "@/components/organisms/contact/ContactForm";
import { BoardMembers } from "@/components/organisms/contact/BoardMembers";

export function ContactContent() {
  const { query } = useRouter();
  const prefillMessage = (query.message as string) ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md lg:max-w-6xl mx-auto px-6 py-8"
    >
      {/* Header with Yellow Accent Bar */}
      <PageHeading title="Contact" subtitle="Neem contact met ons op!" />

      <ContactForm prefillMessage={prefillMessage} />
      <BoardMembers />
    </motion.div>
  );
}
