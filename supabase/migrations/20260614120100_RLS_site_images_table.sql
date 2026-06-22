ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_images_select_public"
  ON site_images FOR SELECT
  USING (true);

CREATE POLICY "site_images_insert_admin"
  ON site_images FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "site_images_update_admin"
  ON site_images FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "site_images_delete_admin"
  ON site_images FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
