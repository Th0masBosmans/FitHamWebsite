ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "albums_select_public"
  ON albums FOR SELECT
  USING (true);

CREATE POLICY "albums_insert_admin"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "albums_update_admin"
  ON albums FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "albums_delete_admin"
  ON albums FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
