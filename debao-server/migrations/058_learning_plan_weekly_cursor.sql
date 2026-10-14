alter table learning_plans add column if not exists generated_through date;
alter table learning_plans add column if not exists content_cursor integer not null default 0;
alter table learning_plans add column if not exists content_offset_minutes integer not null default 0;
