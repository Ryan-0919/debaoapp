-- A question row in the team's weekly template may override the stage-wide
-- question push count. This keeps the default simple while allowing a day to
-- contain a larger or smaller practice set.
alter table learning_stage_plan_items
  add column if not exists question_count integer;

alter table learning_stage_plan_items
  drop constraint if exists learning_stage_plan_items_question_count_check;
alter table learning_stage_plan_items
  add constraint learning_stage_plan_items_question_count_check
  check (question_count is null or question_count between 1 and 50);
