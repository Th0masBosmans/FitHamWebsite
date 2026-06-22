ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slideshow_images_select_public"
  ON slideshow_images FOR SELECT
  USING (true);

CREATE POLICY "slideshow_images_insert_admin"
  ON slideshow_images FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "slideshow_images_delete_admin"
  ON slideshow_images FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
