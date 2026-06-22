ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_members_select_public"
  ON board_members FOR SELECT
  USING (true);

CREATE POLICY "board_members_insert_admin"
  ON board_members FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "board_members_update_admin"
  ON board_members FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "board_members_delete_admin"
  ON board_members FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
