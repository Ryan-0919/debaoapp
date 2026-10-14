-- Weekly and stage assessments reuse the published objective-paper flow.
alter table learning_stage_plan_items
  drop constraint if exists learning_stage_plan_items_content_type_check;
alter table learning_stage_plan_items
  add constraint learning_stage_plan_items_content_type_check
  check (content_type in ('course', 'question', 'subjective', 'assessment', 'card', 'task'));
