ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_public"
  ON staff FOR SELECT
  USING (true);

CREATE POLICY "staff_insert_admin"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "staff_update_admin"
  ON staff FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "staff_delete_admin"
  ON staff FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
