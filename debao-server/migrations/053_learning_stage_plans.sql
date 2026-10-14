create table if not exists learning_stage_plan_configs (
  stage_id text primary key references learning_stages(id) on delete cascade,
  daily_minutes integer not null default 120 check (daily_minutes between 1 and 1440),
  min_daily_minutes integer not null default 30 check (min_daily_minutes between 1 and 1440),
  max_daily_minutes integer not null default 180 check (max_daily_minutes between 1 and 1440),
  study_days jsonb not null default '[1,2,3,4,5,6,0]'::jsonb,
  duration_days integer not null default 30 check (duration_days between 1 and 730),
  makeup_policy varchar(20) not null default 'spread' check (makeup_policy in ('spread', 'weekend')),
  status varchar(20) not null default 'published' check (status in ('draft', 'published')),
  version integer not null default 1 check (version > 0),
  published_at timestamptz,
  published_snapshot jsonb,
  published_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);

alter table learning_stage_plan_configs add column if not exists status varchar(20) not null default 'published';
alter table learning_stage_plan_configs add column if not exists min_daily_minutes integer not null default 30;
alter table learning_stage_plan_configs add column if not exists max_daily_minutes integer not null default 180;
alter table learning_stage_plan_configs add column if not exists version integer not null default 1;
alter table learning_stage_plan_configs add column if not exists published_at timestamptz;
alter table learning_stage_plan_configs add column if not exists published_snapshot jsonb;
alter table learning_stage_plan_configs add column if not exists published_by uuid references admin_users(id);

alter table learning_plans add column if not exists class_type_id text;
alter table learning_plans add column if not exists stage_id text references learning_stages(id);
alter table learning_plans add column if not exists auto_generated boolean not null default false;
alter table learning_tasks add column if not exists content_type varchar(20);
alter table learning_tasks add column if not exists content_id text;
alter table learning_tasks add column if not exists subject_id text;

create table if not exists learning_stage_plan_items (
  id text primary key,
  stage_id text not null references learning_stages(id) on delete cascade,
  content_type varchar(20) not null check (content_type in ('course', 'question', 'card', 'task')),
  content_id text,
  title varchar(160) not null,
  minutes integer not null check (minutes between 1 and 1440),
  sort_order integer not null default 0,
  required boolean not null default true,
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_stage_plan_items_order_idx
  on learning_stage_plan_items (stage_id, sort_order, created_at);

-- Stage codes are scoped to a class type. Different products may both have a
-- `foundation` stage; the old migration's global unique constraint blocked
-- that valid configuration.
alter table learning_stages drop constraint if exists learning_stages_code_key;
create unique index if not exists learning_stages_class_type_code_uq on learning_stages (class_type_id, code);
create unique index if not exists learning_plans_auto_stage_active_uq
  on learning_plans (user_id, stage_id)
  where auto_generated = true and status = 'active' and stage_id is not null;
