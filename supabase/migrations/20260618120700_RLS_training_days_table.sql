ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_days_select_public"
  ON training_days FOR SELECT
  USING (true);

CREATE POLICY "training_days_insert_admin"
  ON training_days FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "training_days_update_admin"
  ON training_days FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "training_days_delete_admin"
  ON training_days FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
