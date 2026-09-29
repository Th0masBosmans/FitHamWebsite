"use client";

import { useState, type FormEvent } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { TurnstileWidget, isTurnstileConfigured } from "@/components/ui/TurnstileWidget";

const inputClasses =
  "w-full px-4 py-3 rounded-xl border-2 border-(--color-primary-brand)/20 focus:border-(--color-primary-brand) focus:outline-none transition-all text-(--color-primary-brand) font-semibold";
const labelClasses = "block text-(--color-primary-brand) mb-2 label-regular font-bold";

type SubmitStatus = "idle" | "sending" | "success" | "error";

/**
 * Formulier voor de API op /onze-club/api. Naam en e-mail zijn optioneel: wie ze
 * leeg laat, meldt anoniem. /api/integrity mailt het bericht door naar de API.
 */
export function IntegrityForm() {
  const emptyForm = { name: "", email: "", message: "" };
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // Het bewijsje van Turnstile dat de bezoeker geen bot is (zie components/ui/TurnstileWidget).
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  const waitingForCaptcha = isTurnstileConfigured && !captchaToken;
  const buttonLabel =
    status === "sending" ? "Versturen..." : waitingForCaptcha ? "Even verifiëren..." : "Bericht versturen";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken: captchaToken }),
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
    // Een token werkt maar één keer, dus een volgend bericht heeft een nieuw nodig.
    setCaptchaReset((value) => value + 1);
  };

  return (
    <form
      id="api-formulier"
      onSubmit={handleSubmit}
      className="mt-6 lg:mt-8 scroll-mt-24 bg-white/90 backdrop-blur-md rounded-2xl p-6 lg:p-10 shadow-xl border-2 border-white/50"
    >
      <h2
        className="text-(--color-primary-brand) mb-2 lg:mb-3 title-section"
        style={{ fontWeight: "var(--font-weight-extrabold)" }}
      >
        Stuur een bericht naar de API
      </h2>
      <p className="text-(--color-primary-brand) leading-relaxed body-regular font-medium mb-5">
        Je bericht gaat rechtstreeks naar onze API. Je naam en e-mailadres zijn optioneel: laat ze
        leeg als je anoniem wilt blijven, of vul ze in als je graag een antwoord krijgt.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="integrity-name" className={labelClasses}>
            Naam <span className="font-medium opacity-60">(optioneel)</span>
          </label>
          <input
            type="text"
            id="integrity-name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className={inputClasses}
            placeholder="Jouw naam"
          />
        </div>
        <div>
          <label htmlFor="integrity-email" className={labelClasses}>
            E-mail <span className="font-medium opacity-60">(optioneel)</span>
          </label>
          <input
            type="email"
            id="integrity-email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className={inputClasses}
            placeholder="jouw@email.be"
          />
        </div>
      </div>

      <label htmlFor="integrity-message" className={`${labelClasses} mt-4`}>
        Bericht *
      </label>
      <textarea
        id="integrity-message"
        required
        value={formData.message}
        onChange={(event) => setFormData({ ...formData, message: event.target.value })}
        rows={6}
        className={`${inputClasses} resize-none`}
        placeholder="Vertel hier wat er gebeurd is of wat je dwarszit..."
      />

      <div className="mt-4">
        <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaReset} />
      </div>

      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-(--color-primary-brand)/70 label-small font-semibold">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Naam en e-mail leeg? Dan blijf je anoniem
        </span>
        <button
          type="submit"
          disabled={status === "sending" || waitingForCaptcha}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-(--color-primary-brand) px-6 py-3 text-white label-regular font-extrabold shadow-md transition-all hover:-translate-y-0.5 hover:bg-(--color-primary-brand-dark) hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <Send className="h-5 w-5 shrink-0" />
          {buttonLabel}
        </button>
      </div>

      {status === "success" && (
        <p className="mt-4 text-green-700 label-regular font-bold">
          Bedankt. Je bericht is doorgestuurd naar onze API.
        </p>
      )}
      {status === "error" && <p className="mt-4 text-red-600 label-regular font-bold">{errorMessage}</p>}
    </form>
  );
}
