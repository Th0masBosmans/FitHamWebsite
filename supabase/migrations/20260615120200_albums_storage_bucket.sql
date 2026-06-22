-- Public bucket holding the album images and videos (replaces Cloudinary for this feature).
INSERT INTO storage.buckets (id, name, public)
VALUES ('albums', 'albums', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read the media (the gallery is public).
CREATE POLICY "albums_storage_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'albums');

-- Only admins may upload / change / remove media.
CREATE POLICY "albums_storage_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'albums' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "albums_storage_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'albums' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (bucket_id = 'albums' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "albums_storage_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'albums' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
