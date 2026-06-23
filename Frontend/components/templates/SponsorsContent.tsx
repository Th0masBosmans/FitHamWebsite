"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SponsorRepository } from "@/repository/sponsorRepository";
import { PageHeading } from "@/components/molecules/PageHeading";
import { Sponsor } from "@/types";

const sponsorRepository = new SponsorRepository();

export function SponsorsContent() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    sponsorRepository.fetchSponsors().then(setSponsors);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md lg:max-w-6xl mx-auto px-6 py-8"
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 inline-flex items-center gap-2 text-white hover:text-(--color-accent) transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/20 font-bold"
      >
        <ArrowLeft className="w-5 h-5" />
        Terug
      </button>

      {/* Header */}
      <PageHeading
        title="Sponsors"
        subtitle="Dankzij de steun van onze sponsors kunnen we FIT HAM blijven ontwikkelen en onze teams de beste faciliteiten bieden. Bedankt voor jullie vertrouwen!"
      />

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
        {sponsors.map((sponsor, index) => (
          <motion.div
            key={sponsor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-white/50 hover:scale-[1.02] transition-transform"
          >
            <div className="h-32 lg:h-40 overflow-hidden">
              <img src={sponsorRepository.getSponsorImageUrl(sponsor.image)} alt={sponsor.name} loading="lazy" className="w-full h-full object-cover" />
            </div>
            {sponsor.website_url && (
              <a
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <span className="text-white label-large font-bold">
                  {sponsor.name}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white border border-white/40 px-4 py-1.5 rounded-lg label-small font-semibold">
                  Bezoek website
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* Sponsor Worden CTA */}
      <div className="mt-12 lg:max-w-3xl lg:mx-auto">
        <div className="bg-linear-to-br from-(--color-primary-brand) to-(--color-secondary-brand) rounded-2xl p-6 lg:p-8 shadow-2xl border-2 border-(--color-accent) text-center">
          <h2 className="text-white title-section mb-3" style={{ fontWeight: "var(--font-weight-extrabold)" }}>
            Word ook sponsor!
          </h2>
          <p className="text-white/90 mb-5 leading-relaxed font-medium">
            Wilt u ook FIT HAM Volleybal steunen? Neem contact met ons op voor de mogelijkheden.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-(--color-accent) text-(--color-primary-brand) px-8 py-3 rounded-xl hover:bg-white transition-colors shadow-lg font-extrabold"
          >
            <ArrowRight className="w-5 h-5 shrink-0" />
            <span>Neem Contact Op</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
