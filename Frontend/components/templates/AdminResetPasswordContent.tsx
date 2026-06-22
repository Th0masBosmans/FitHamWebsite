"use client";

import { useState } from "react";
import { supabase } from "@/supabase";
import { AdminAuthLayout, authInputClass, authButtonClass } from "./AdminAuthLayout";

export function AdminResetPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/admin/update-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <AdminAuthLayout
      title="Wachtwoord vergeten"
      subtitle="Vul je e-mailadres in en we sturen je een link om je wachtwoord te herstellen."
      backLink={{ href: "/admin/login", label: "Terug naar login" }}
    >
      {sent ? (
        <p className="text-sm font-medium text-green-700">
          E-mail verstuurd. Controleer je inbox en klik op de link om je wachtwoord te wijzigen.
        </p>
      ) : (
        <>
          {error && <p className="mb-5 text-sm font-medium text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClass}
              placeholder="E-mailadres"
              aria-label="E-mailadres"
            />

            <div className="flex justify-end pt-3">
              <button type="submit" disabled={isLoading} className={authButtonClass}>
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Versturen"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </AdminAuthLayout>
  );
}
