-- Allow album media (videos) up to 200 MB. Note: the effective limit is the
-- smaller of this and the project-wide upload limit (Dashboard → Storage → Settings).
UPDATE storage.buckets
SET file_size_limit = 209715200 -- 200 * 1024 * 1024 bytes
WHERE id = 'albums';
