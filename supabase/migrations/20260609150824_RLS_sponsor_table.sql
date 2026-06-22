ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsors_select_public"
  ON sponsors FOR SELECT
  USING (true);

CREATE POLICY "sponsors_insert_admin"
  ON sponsors FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "sponsors_update_admin"
  ON sponsors FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');