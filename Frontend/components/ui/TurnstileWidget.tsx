"use client";

import { useEffect, useRef } from "react";

// Het vinkje van Cloudflare Turnstile onderaan een formulier. Het houdt bots
// tegen zonder dat de bezoeker puzzels moet oplossen: meestal ziet die enkel een
// vinkje dat zichzelf aanzet.
//
// Gebruik in een formulier:
//
//     const [captchaToken, setCaptchaToken] = useState<string | null>(null);
//     const [captchaReset, setCaptchaReset] = useState(0);
//     ...
//     <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaReset} />
//
// Stuur het token mee in de body van je fetch, en laat de API het nakijken met
// checkTurnstile uit lib/formGuard. Ging het versturen mis? Verhoog dan
// captchaReset met 1: een token werkt maar één keer, dus er moet een nieuw
// gehaald worden voor de volgende poging.

/** Cloudflare laadt dit zelf op window; dit vertelt TypeScript hoe het eruitziet. */
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme?: "auto" | "light" | "dark";
          language?: string;
          size?: "normal" | "flexible" | "compact";
          appearance?: "always" | "execute" | "interaction-only";
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Publieke sleutel, hoort in NEXT_PUBLIC_ zodat de browser ze mag zien. De
// geheime tegenhanger (TURNSTILE_SECRET_KEY) blijft op de server.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Staat de sitekey in .env? Zo niet, dan laten formulieren de knop gewoon werken. */
export const isTurnstileConfigured = Boolean(SITE_KEY);

export function TurnstileWidget({
  onToken,
  resetSignal = 0,
}: {
  /** Krijgt het token binnen, of null als het verlopen of mislukt is. */
  onToken: (token: string | null) => void;
  /** Verhoog dit getal om een nieuw token op te halen na een mislukte poging. */
  resetSignal?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Via een ref, zodat een nieuwe onToken-functie het vinkje niet herbouwt.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) return;

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      // Al een vinkje staan? Niet nog eens tekenen.
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        // Vast op licht: de site heeft geen donkere variant, en de standaard
        // ("auto") zou het vinkje zwart maken bij bezoekers met een donker
        // systeemthema.
        theme: "light",
        // Anders volgt de tekst de browsertaal van de bezoeker.
        language: "nl",
        // Past zich aan de breedte van het formulier aan in plaats van een
        // vaste 300px.
        size: "flexible",
        // Blijft onzichtbaar zolang Cloudflare de bezoeker vertrouwt. Enkel bij
        // twijfel verschijnt het vinkje alsnog, zodat iemand met een VPN of een
        // ouder toestel niet zonder uitleg vastloopt.
        appearance: "interaction-only",
        callback: (token) => onTokenRef.current(token),
        // Een token blijft maar een paar minuten geldig.
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    };

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);

    if (window.turnstile) {
      renderWidget();
    } else {
      // Het script staat er misschien al door een ander formulier op de pagina.
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // 0 is de beginwaarde, dan is er nog niets om te herstellen.
    if (resetSignal === 0) return;
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenRef.current(null);
    }
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}
