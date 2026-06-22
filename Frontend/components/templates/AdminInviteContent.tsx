"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/supabase";
import { AdminAuthLayout, authInputClass, authButtonClass } from "./AdminAuthLayout";

export function AdminInviteContent() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for error hash params from Supabase (e.g. expired invite link).
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const hashError = params.get("error_description");
    if (hashError) {
      setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
      setReady(false);
      return;
    }

    let resolved = false;
    let timer: ReturnType<typeof setTimeout>;

    // Supabase automatically processes the invite token from the URL hash.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        resolved = true;
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resolved = true;
        setReady(true);
      } else {
        // No valid token in the URL → no session is ever created. Don't spin forever.
        timer = setTimeout(() => {
          if (!resolved) setError("Deze uitnodigingslink is ongeldig of verlopen.");
        }, 3000);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens bevatten.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <AdminAuthLayout
      title="Account activeren"
      subtitle="Kies een wachtwoord voor je beheerdersaccount."
      backLink={{ href: "/", label: "Terug naar site" }}
    >
      {error && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      {!ready && !error && (
        <div className="flex justify-center py-8">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary-brand)] border-t-transparent" />
        </div>
      )}

      {ready && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={authInputClass}
            placeholder="Wachtwoord"
            aria-label="Wachtwoord"
          />

          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={authInputClass}
            placeholder="Wachtwoord bevestigen"
            aria-label="Wachtwoord bevestigen"
          />

          <div className="flex justify-end pt-3">
            <button type="submit" disabled={isLoading} className={authButtonClass}>
              {isLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Account activeren"
              )}
            </button>
          </div>
        </form>
      )}
    </AdminAuthLayout>
  );
}
