"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { calculateAge } from "@/lib/age";
import { BirthDateField, ExperienceField, Field, NameFields } from "./registrationFields";

// Het inschrijvingsvenster dat opengaat als je op een lidgeld-kaartje klikt
// (pages/public/MembershipContent). Versturen gaat naar /api/registration, dat
// er een mail van maakt voor het bestuur. Er wordt hier niets in de database
// opgeslagen.

type RegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Naam van het gekozen lidgeld, komt in de mail als categorie. */
  teamName: string;
};

type SubmitStatus = "idle" | "sending" | "success" | "error";

const emptyForm = {
  playerFirstName: "",
  playerLastName: "",
  birthDate: "",
  experienceDescription: "",
  email: "",
};

export function RegistrationModal({ isOpen, onClose, teamName }: RegistrationModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const age = formData.birthDate ? calculateAge(formData.birthDate) : null;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: teamName,
          playerFirstName: formData.playerFirstName,
          playerLastName: formData.playerLastName,
          birthDate: formData.birthDate,
          email: formData.email,
          experience: formData.experienceDescription,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Versturen mislukt");
      }

      setStatus("success");
      setFormData(emptyForm);
    } catch (caughtError) {
      setStatus("error");
      setErrorMessage(caughtError instanceof Error ? caughtError.message : "Versturen mislukt");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-6 h-6 text-white" />
                    <h2 className="text-white title-section">Inschrijven</h2>
                  </div>
                  <p className="text-white/90 label-regular">{teamName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  aria-label="Sluiten"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <h3 className="text-[var(--color-primary-brand)] mb-4 label-large font-bold">
                  Jouw Gegevens
                </h3>

                <div className="space-y-4">
                  <Field label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} />

                  <NameFields
                    firstName={formData.playerFirstName}
                    lastName={formData.playerLastName}
                    onChange={handleChange}
                  />

                  <BirthDateField value={formData.birthDate} age={age} onChange={handleChange} />

                  <ExperienceField description={formData.experienceDescription} onChange={handleChange} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-[var(--color-primary-brand)]/30 text-[var(--color-primary-brand)] rounded-lg hover:bg-[var(--color-primary-brand)]/5 transition-colors font-bold"
                >
                  {status === "success" ? "Sluiten" : "Annuleren"}
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Versturen..." : "Versturen"}
                </button>
              </div>

              {status === "success" && (
                <p className="text-center text-green-700 label-regular font-bold">
                  Bedankt! Je inschrijvingsaanvraag is verstuurd. Het bestuur neemt zo snel mogelijk contact op.
                </p>
              )}
              {status === "error" && (
                <p className="text-center text-red-600 label-regular font-bold">{errorMessage}</p>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
