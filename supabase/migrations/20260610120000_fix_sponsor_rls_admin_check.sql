-- The top-level 'role' claim in a Supabase JWT is the Postgres role
-- ('anon' / 'authenticated'), never 'admin', so the old policies could
-- never pass. Admin status lives in app_metadata instead, which only
-- the service role can modify (users cannot edit it themselves).

DROP POLICY IF EXISTS "sponsors_insert_admin" ON sponsors;
DROP POLICY IF EXISTS "sponsors_update_admin" ON sponsors;

CREATE POLICY "sponsors_insert_admin"
  ON sponsors FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "sponsors_update_admin"
  ON sponsors FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "sponsors_delete_admin"
  ON sponsors FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
