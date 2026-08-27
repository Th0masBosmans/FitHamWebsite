"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Send } from "lucide-react";
import { PhoneInput } from "react-international-phone";

const inputClasses =
  "w-full px-4 py-3 rounded-xl border-2 border-[var(--color-primary-brand)]/20 focus:border-[var(--color-primary-brand)] focus:outline-none transition-all text-[var(--color-primary-brand)] font-semibold";
const labelClasses = "block text-[var(--color-primary-brand)] mb-2 label-regular font-bold";

// De omkadering van het telefoonveld zit in globals.css (.phone-field); hier
// staan enkel nog de kleuren van het uitklaplijstje met landen.
const phoneFieldStyle = {
  "--react-international-phone-text-color": "var(--color-primary-brand)",
  "--react-international-phone-dropdown-item-text-color": "var(--color-primary-brand)",
  "--react-international-phone-dropdown-item-font-size": "15px",
  "--react-international-phone-selected-dropdown-item-background-color":
    "color-mix(in srgb, var(--color-primary-brand) 12%, transparent)",
  "--react-international-phone-dropdown-top": "52px",
  "--react-international-phone-dropdown-shadow": "0 10px 25px rgb(0 0 0 / 0.15)",
} as React.CSSProperties;

type SubmitStatus = "idle" | "sending" | "success" | "error";

export function ContactForm({ prefillMessage }: { prefillMessage: string }) {
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    message: prefillMessage,
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (prefillMessage) {
      setFormData((prev) => ({ ...prev, message: prefillMessage }));
    }
    if (typeof window !== "undefined" && window.location.hash === "#contact-form") {
      setTimeout(() => {
        document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [prefillMessage]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Het veld staat al vooraf ingevuld met de landcode, dus "required" alleen volstaat niet.
    if (formData.phoneNumber.replace(/\D/g, "").length < 8) {
      setStatus("error");
      setErrorMessage("Vul een geldig telefoonnummer in");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Versturen mislukt");
      }

      setStatus("success");
      setFormData({
        email: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        message: "",
      });
    } catch (caughtError) {
      setStatus("error");
      setErrorMessage(caughtError instanceof Error ? caughtError.message : "Versturen mislukt");
    }
  };

  return (
    <div className="mb-6" id="contact-form">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-8 bg-[var(--color-accent)] rounded-full"></div>
        <h2 className="text-white whitespace-nowrap title-section">Stuur een bericht</h2>
        <div className="h-1 flex-1 bg-[var(--color-accent)] rounded-full"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border-2 border-white/50"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className={labelClasses}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className={inputClasses}
              placeholder="jouw@email.be"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className={labelClasses}>
              Telefoonnummer *
            </label>
            <PhoneInput
              defaultCountry="be"
              preferredCountries={["be", "nl", "fr", "de", "lu"]}
              value={formData.phoneNumber}
              onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
              inputProps={{ id: "phoneNumber", required: true }}
              className="phone-field"
              style={phoneFieldStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelClasses}>
                Voornaam
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                className={inputClasses}
                placeholder="Jouw voornaam"
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClasses}>
                Naam
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                className={inputClasses}
                placeholder="Jouw naam"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className={labelClasses}>
              Bericht *
            </label>
            <textarea
              id="message"
              required
              value={formData.message}
              onChange={(event) => setFormData({ ...formData, message: event.target.value })}
              rows={5}
              className={`${inputClasses} resize-none`}
              placeholder="Typ hier jouw bericht..."
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-[var(--color-primary-brand)] text-white px-6 py-4 rounded-xl hover:bg-[var(--color-primary-brand-dark)] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 label-base disabled:opacity-60 disabled:cursor-not-allowed font-bold"
          >
            <Send className="w-5 h-5 flex-shrink-0" />
            <span>{status === "sending" ? "Versturen..." : "Verstuur Bericht"}</span>
          </button>

          {status === "success" && (
            <p className="text-center text-green-700 label-regular font-bold">
              Bedankt! Je bericht is verstuurd.
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-red-600 label-regular font-bold">
              {errorMessage}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
