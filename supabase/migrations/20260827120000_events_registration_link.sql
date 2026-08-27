-- Optionele inschrijf- of bestelknop op een evenement, bv. een link naar Twizzit.
-- Leeg = geen knop. Het opschrift mag leeg blijven; de site valt dan terug op
-- een standaardtekst.
ALTER TABLE events
  ADD COLUMN registration_url TEXT,
  ADD COLUMN registration_label TEXT;
