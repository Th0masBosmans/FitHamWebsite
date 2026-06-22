-- Link a website team to its VolleyAdmin data so the team page can fetch
-- standings (rangschikking) and this week's match (with score + location).
--   reeks          : VolleyAdmin series code, e.g. "LHP1" or "VMU17N1R1-A".
--                    Identifies both the standings to fetch and which matches
--                    in the club calendar belong to this team.
--   volley_club_id : stamnummer the team plays under; null falls back to the
--                    club default (L-0759). Some youth teams play under
--                    Stalvoc's L-0715.
-- The team's own row in the standings is highlighted by matching "ham"/"fit"
-- in the team name, so no separate VolleyAdmin team name is stored.
ALTER TABLE teams
  ADD COLUMN reeks TEXT,
  ADD COLUMN volley_club_id TEXT;
