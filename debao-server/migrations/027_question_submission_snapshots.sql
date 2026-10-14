-- A question may be edited or archived after a learner submits it. Preserve
-- the exact question metadata used for the historical report.
alter table if exists question_submissions
  add column if not exists question_snapshot jsonb;
