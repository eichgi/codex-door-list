-- PostgREST can retain relationship metadata from before a table rename.
-- Refresh it so the renamed registrations foreign keys are discoverable.
notify pgrst, 'reload schema';
