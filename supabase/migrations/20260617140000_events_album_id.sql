-- Link an event to a photo album. Nullable: most events have no album yet.
-- ON DELETE SET NULL so removing an album just unlinks it from its events.
ALTER TABLE events
  ADD COLUMN album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL;
