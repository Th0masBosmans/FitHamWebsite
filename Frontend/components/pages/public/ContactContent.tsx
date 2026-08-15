"use client";

import { useRouter } from "next/router";
import { motion } from "motion/react";
import { PageHeading } from "@/components/ui/PageHeading";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { BoardMembers } from "@/components/sections/contact/BoardMembers";
import { IntegrityContact } from "@/components/sections/contact/IntegrityContact";

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
      {/* Titel met het gele balkje */}
      <PageHeading title="Contact" subtitle="Neem contact met ons op!" />

      <ContactForm prefillMessage={prefillMessage} />
      <IntegrityContact />
      <BoardMembers />
    </motion.div>
  );
}
