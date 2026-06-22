ALTER TABLE membership_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membership_fees_select_public"
  ON membership_fees FOR SELECT
  USING (true);

CREATE POLICY "membership_fees_insert_admin"
  ON membership_fees FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "membership_fees_update_admin"
  ON membership_fees FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "membership_fees_delete_admin"
  ON membership_fees FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
