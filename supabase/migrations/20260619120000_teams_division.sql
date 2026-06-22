-- Group teams into the four divisions shown on the public Teams page
-- (jeugd / dames / heren / recreatie). The page renders one collapsible
-- section per division, so every team needs exactly one of these values.
-- Existing rows default to 'recreatie'; admins can re-assign them in the
-- team form.
ALTER TABLE teams
  ADD COLUMN division TEXT NOT NULL DEFAULT 'recreatie'
    CHECK (division IN ('jeugd', 'dames', 'heren', 'recreatie'));
