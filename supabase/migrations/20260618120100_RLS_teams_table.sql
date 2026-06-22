ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_public"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "teams_insert_admin"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "teams_update_admin"
  ON teams FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "teams_delete_admin"
  ON teams FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
