// De verbinding met Supabase, onze database. Alles wat de site opslaat of
// ophaalt (teams, evenementen, albums, sponsors, ...) loopt hierlangs; zie de
// bestanden in repository/.
//
// Deze sleutels zijn publiek en mogen in de browser staan. Wat iemand ermee mag
// doen, bepaalt Supabase zelf met de regels per tabel (zie supabase/migrations).

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
