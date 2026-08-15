import type { NextApiRequest } from "next";
import { createClient } from "@supabase/supabase-js";

// Controleert of een API-aanvraag van een ingelogde beheerder komt.
//
// De browser stuurt zijn Supabase-token mee; wij laten Supabase nakijken of dat
// token echt en nog geldig is, en of de gebruiker de rol 'admin' heeft. Dat is
// dezelfde rol die de database zelf ook controleert in haar RLS-regels.
//
// Gebruikt door de twee Cloudinary-routes (/api/cloudinary/*), want zonder deze
// controle zou iedereen bestanden kunnen uploaden of verwijderen.
export async function isAdminRequest(req: NextApiRequest): Promise<boolean> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return false;

  return (data.user.app_metadata as { role?: string } | null)?.role === "admin";
}
