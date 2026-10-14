-- Link each external course item to the objective knowledge points it teaches.
-- Cards and practice slots use the points declared by preceding course items.
alter table learning_stage_plan_items
  add column if not exists knowledge_point_ids jsonb not null default '[]'::jsonb;
