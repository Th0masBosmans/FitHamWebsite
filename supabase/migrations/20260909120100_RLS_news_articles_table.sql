ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_articles_select_public"
  ON news_articles FOR SELECT
  USING (true);

CREATE POLICY "news_articles_insert_admin"
  ON news_articles FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "news_articles_update_admin"
  ON news_articles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "news_articles_delete_admin"
  ON news_articles FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
