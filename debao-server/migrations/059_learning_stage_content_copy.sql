-- Stage content is described in the learning center. Courses are consumed
-- outside the app, so the stage item keeps copy instead of a playable lesson id.
alter table learning_stage_plan_items
  add column if not exists description text;

alter table learning_tasks
  add column if not exists description text;
