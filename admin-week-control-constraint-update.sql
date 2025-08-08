-- Relax the constraint to allow exactly 1 or 2 active weeks per row
-- Run this in Supabase SQL editor

ALTER TABLE admin_week_control
  DROP CONSTRAINT IF EXISTS only_one_week_active;

ALTER TABLE admin_week_control
  ADD CONSTRAINT one_or_two_weeks_active
  CHECK (
    (COALESCE(week_1,0) + COALESCE(week_2,0) + COALESCE(week_3,0) + COALESCE(week_4,0)
     + COALESCE(week_5,0) + COALESCE(week_6,0) + COALESCE(week_7,0) + COALESCE(week_8,0))
     IN (1, 2)
  );

-- Optional: ensure each week flag is strictly 0 or 1 (skip if already set per column)
-- ALTER TABLE admin_week_control
--   ADD CONSTRAINT week_flags_binary CHECK (
--     week_1 IN (0,1) AND week_2 IN (0,1) AND week_3 IN (0,1) AND week_4 IN (0,1) AND
--     week_5 IN (0,1) AND week_6 IN (0,1) AND week_7 IN (0,1) AND week_8 IN (0,1)
--   );

-- Note: Insert/update rows with at least one and at most two active week flags to pass this constraint. 