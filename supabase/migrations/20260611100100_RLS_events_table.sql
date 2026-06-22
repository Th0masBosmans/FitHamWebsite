ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_public"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "events_insert_admin"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "events_update_admin"
  ON events FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "events_delete_admin"
  ON events FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
