"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Send } from "lucide-react";

const inputClasses =
  "w-full px-4 py-3 rounded-xl border-2 border-[var(--color-primary-brand)]/20 focus:border-[var(--color-primary-brand)] focus:outline-none transition-all text-[var(--color-primary-brand)] font-semibold";
const labelClasses = "block text-[var(--color-primary-brand)] mb-2 label-regular font-bold";

type SubmitStatus = "idle" | "sending" | "success" | "error";

export function ContactForm({ prefillMessage }: { prefillMessage: string }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: prefillMessage });
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
      setFormData({ name: "", email: "", message: "" });
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
            <label htmlFor="name" className={labelClasses}>
              Naam
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              className={inputClasses}
             
              placeholder="Jouw naam"
            />
          </div>

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
             
              placeholder="jouw@email.nl"
            />
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
