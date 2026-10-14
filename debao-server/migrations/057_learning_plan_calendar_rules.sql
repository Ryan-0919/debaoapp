create table if not exists learning_plan_holiday_calendars (
  id text primary key,
  name varchar(120) not null,
  dates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table learning_class_types add column if not exists end_date date not null default '2099-12-31';

alter table learning_stage_plan_configs add column if not exists total_minutes integer not null default 0;
alter table learning_stage_plan_configs add column if not exists weekday_min_minutes integer not null default 30;
alter table learning_stage_plan_configs add column if not exists weekday_max_minutes integer not null default 180;
alter table learning_stage_plan_configs add column if not exists weekend_min_minutes integer not null default 60;
alter table learning_stage_plan_configs add column if not exists weekend_max_minutes integer not null default 240;
alter table learning_stage_plan_configs add column if not exists holiday_min_minutes integer not null default 60;
alter table learning_stage_plan_configs add column if not exists holiday_max_minutes integer not null default 180;
alter table learning_stage_plan_configs add column if not exists holiday_dates jsonb not null default '[]'::jsonb;

update learning_stage_plan_configs c
set total_minutes = coalesce(nullif(c.total_minutes, 0), (select coalesce(sum(i.minutes), 0) from learning_stage_plan_items i where i.stage_id = c.stage_id));
