"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type RegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  isYouth: boolean;
}

const labelClasses = "block text-[var(--color-primary-brand)]/70 label-regular mb-1 font-semibold";
const inputClasses =
  "w-full px-4 py-2 border-2 border-[var(--color-primary-brand)]/20 rounded-lg focus:border-[var(--color-primary-brand)] focus:outline-none transition-colors";

export function RegistrationModal({ isOpen, onClose, teamName, isYouth }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    playerFirstName: "",
    playerLastName: "",
    birthDate: "",
    hasExperience: "",
    experienceDescription: "",
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    email: "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Inschrijving voor", teamName, formData);
    alert(`Bedankt voor je inschrijving voor ${teamName}! We nemen zo snel mogelijk contact op.`);
    onClose();
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
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
            {/* Header */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Speler Gegevens */}
              <div>
                <h3 className="text-[var(--color-primary-brand)] mb-4 label-large font-bold">
                  {isYouth ? "Gegevens Speler" : "Jouw Gegevens"}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClasses}>
                        Voornaam *
                      </label>
                      <input type="text" name="playerFirstName" value={formData.playerFirstName} onChange={handleChange} required className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>
                        Naam *
                      </label>
                      <input type="text" name="playerLastName" value={formData.playerLastName} onChange={handleChange} required className={inputClasses} />
                    </div>
                  </div>

                  {isYouth && (
                    <div>
                      <label className={labelClasses}>
                        Geboortedatum *
                      </label>
                      <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required className={inputClasses} />
                    </div>
                  )}

                  <div>
                    <label className="block text-[var(--color-primary-brand)]/70 label-regular mb-2 font-semibold">
                      {isYouth ? "Eerder gevolleybald? *" : "Eerdere volleybalervaring *"}
                    </label>
                    {isYouth ? (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="hasExperience" value="ja" checked={formData.hasExperience === "ja"} onChange={handleChange} required className="w-4 h-4 text-[var(--color-primary-brand)] focus:ring-[var(--color-primary-brand)]" />
                          <span className="text-[var(--color-primary-brand)] font-semibold">Ja</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="hasExperience" value="nee" checked={formData.hasExperience === "nee"} onChange={handleChange} required className="w-4 h-4 text-[var(--color-primary-brand)] focus:ring-[var(--color-primary-brand)]" />
                          <span className="text-[var(--color-primary-brand)] font-semibold">Nee</span>
                        </label>
                      </div>
                    ) : (
                      <textarea name="experienceDescription" value={formData.experienceDescription} onChange={handleChange} required rows={3} placeholder="Beschrijf je eerdere volleybalervaring..." className={`${inputClasses} resize-none`} />
                    )}
                  </div>
                </div>
              </div>

              {/* Ouder Gegevens (alleen voor jeugd) */}
              {isYouth ? (
                <div>
                  <h3 className="text-[var(--color-primary-brand)] mb-4 label-large font-bold">
                    Gegevens Ouder(s)
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClasses}>
                          Voornaam *
                        </label>
                        <input type="text" name="parentFirstName" value={formData.parentFirstName} onChange={handleChange} required className={inputClasses} />
                      </div>
                      <div>
                        <label className={labelClasses}>
                          Naam *
                        </label>
                        <input type="text" name="parentLastName" value={formData.parentLastName} onChange={handleChange} required className={inputClasses} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>
                        Email *
                      </label>
                      <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} required className={inputClasses} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className={labelClasses}>
                    Email *
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-[var(--color-primary-brand)]/30 text-[var(--color-primary-brand)] rounded-lg hover:bg-[var(--color-primary-brand)]/5 transition-colors font-bold"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-brand)] to-[var(--color-secondary-brand)] text-white rounded-lg hover:shadow-lg transition-all font-bold"
                >
                  Versturen
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
