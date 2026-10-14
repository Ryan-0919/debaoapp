-- Stage content is scheduled by the team's weekly task plan. These rules
-- control what becomes visible after a task is checked off and how many
-- profile-based questions are generated for a question slot.
alter table learning_stage_plan_configs
  add column if not exists card_unlock_rule varchar(40) not null default 'after_course_checkin';
alter table learning_stage_plan_configs
  add column if not exists question_push_count integer not null default 5;
alter table learning_stage_plan_configs
  add column if not exists question_selection_strategy varchar(20) not null default 'profile';

alter table learning_stage_plan_items
  add column if not exists week_day integer;
alter table learning_stage_plan_items
  drop constraint if exists learning_stage_plan_items_minutes_check;
alter table learning_stage_plan_items
  add constraint learning_stage_plan_items_minutes_check check (minutes between 0 and 1440);
alter table learning_stage_plan_items
  add constraint learning_stage_plan_items_week_day_check check (week_day is null or week_day between 1 and 7);

update learning_stage_plan_configs
set card_unlock_rule = coalesce(nullif(card_unlock_rule, ''), 'after_course_checkin'),
    question_push_count = greatest(1, least(question_push_count, 50)),
    question_selection_strategy = 'profile';
