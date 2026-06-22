ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_public"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "players_insert_admin"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "players_update_admin"
  ON players FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "players_delete_admin"
  ON players FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
