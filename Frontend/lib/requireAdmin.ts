import type { NextApiRequest } from "next";
import { createClient } from "@supabase/supabase-js";

// Verifies that an API request comes from a signed-in admin. The browser sends
// its Supabase access token in the Authorization header; we hand it to Supabase
// (which validates the signature and expiry) and then confirm the 'admin' role
// that lives in app_metadata — the same claim the database RLS policies check.
// Returns true only for a valid, non-expired token belonging to an admin user.
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
