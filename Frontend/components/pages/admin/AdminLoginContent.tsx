"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/supabase";
import { AdminAuthLayout, authInputClass, authButtonClass } from "./AdminAuthLayout";

export function AdminLoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      setError("Ongeldig e-mailadres of wachtwoord.");
      return;
    }

    // Een account zonder beheerdersrol werd anders zonder uitleg teruggestuurd
    // naar dit scherm door het slot op het beheerpaneel.
    if ((data.user?.app_metadata as { role?: string } | null)?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Dit account heeft geen toegang tot het beheerpaneel.");
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <AdminAuthLayout
      title="Inloggen"
      subtitle="Beheerdersportaal van Fit Ham"
      backLink={{ href: "/", label: "Terug naar site" }}
    >
      {error && <p className="mb-5 text-sm font-medium text-red-600">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-5">
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

        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={authInputClass}
          placeholder="Wachtwoord"
          aria-label="Wachtwoord"
        />

        {/* Zonder dit linkje was de herstelpagina nergens te vinden. */}
        <div className="flex justify-end">
          <Link
            href="/admin/reset-password"
            className="text-sm font-semibold text-[var(--color-primary-brand)] hover:underline"
          >
            Wachtwoord vergeten?
          </Link>
        </div>

        <div className="pt-3">
          <button type="submit" disabled={isLoading} className={`${authButtonClass} w-full`}>
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Inloggen"
            )}
          </button>
        </div>
      </form>
    </AdminAuthLayout>
  );
}
