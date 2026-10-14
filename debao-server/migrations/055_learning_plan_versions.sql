alter table learning_plans add column if not exists version integer not null default 1;
alter table learning_plans add column if not exists change_reason varchar(300);
alter table learning_plans add column if not exists updated_at timestamptz not null default now();
alter table learning_plans add column if not exists paused_at timestamptz;
alter table learning_plans add column if not exists paused_until date;
alter table learning_plans add column if not exists pause_reason varchar(300);

create table if not exists learning_plan_versions (
  id text primary key,
  plan_id text not null references learning_plans(id) on delete cascade,
  version integer not null check (version > 0),
  reason varchar(300) not null,
  source varchar(20) not null check (source in ('auto', 'admin', 'publish', 'user')),
  snapshot jsonb not null,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  unique (plan_id, version)
);

create index if not exists learning_plan_versions_plan_idx on learning_plan_versions (plan_id, version desc);
