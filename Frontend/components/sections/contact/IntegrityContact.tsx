"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function IntegrityContact() {
  const scrollToApiMember = () => {
    const target =
      document.getElementById("api-board-member") ?? document.getElementById("bestuur");
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Class eerst weghalen (plus reflow) zodat een tweede klik de animatie opnieuw start.
    target.classList.remove("api-highlight");
    void target.offsetWidth;
    target.classList.add("api-highlight");
    target.addEventListener("animationend", () => target.classList.remove("api-highlight"), {
      once: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="mb-6 lg:mb-8"
    >
      <SectionHeading title="API" />
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-150">
        <div className="max-w-3xl mx-auto text-left">
          <h3
            className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section text-center"
            style={{ fontWeight: "var(--font-weight-extrabold)" }}
          >
            Aanspreekpunt integriteit
          </h3>
          <p className="text-(--color-primary-brand) leading-relaxed mb-4 lg:mb-6 body-large font-medium">
            API staat voor <strong className="font-extrabold">Aanspreekpunt Integriteit</strong>. Dit is
            de vertrouwenspersoon binnen onze club bij wie je terecht kan met vragen, twijfels of
            meldingen over grensoverschrijdend gedrag. Zij luistert in alle vertrouwen, denkt met je
            mee en helpt je verder. Dit kan volledig anoniem als je je hier comfortabeler bij voelt.
          </p>
          <p className="text-(--color-primary-brand) leading-relaxed mb-4 lg:mb-6 body-large font-medium">
            Bij Fit Ham is er <strong className="font-extrabold">geen plaats</strong> voor discriminatie,
            pesten, agressie of seksueel grensoverschrijdend gedrag. Iedereen moet zich hier veilig,
            gerespecteerd en welkom voelen: op het veld, in de kleedkamer en daarbuiten.
          </p>
          <p className="text-(--color-primary-brand) leading-relaxed body-large font-medium">
            Heb je ook maar een klein gevoel dat er iets niet juist zit bij jezelf, bij iemand uit je
            team of iemand anders in de club? Twijfel niet en{" "}
            <button
              type="button"
              onClick={scrollToApiMember}
              className="text-(--color-secondary-brand) hover:text-(--color-accent) underline decoration-2 underline-offset-2 transition-colors font-bold"
            >
              neem contact op met onze API
            </button>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
}
