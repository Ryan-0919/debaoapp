create table if not exists learning_stages (
  id text primary key,
  code varchar(80) not null unique,
  name varchar(80) not null,
  description varchar(240),
  conditions jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  status varchar(20) not null default 'active' check (status in ('active', 'disabled')),
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table learning_stages add column if not exists class_type_id text;
alter table learning_stages alter column class_type_id drop not null;

create table if not exists learning_teachers (
  id text primary key,
  stage_id text not null references learning_stages(id),
  name varchar(80) not null,
  subject varchar(120) not null,
  specialty varchar(500) not null,
  sort_order integer not null default 0,
  status varchar(20) not null default 'active' check (status in ('active', 'disabled')),
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_teachers_stage_order_idx on learning_teachers (stage_id, status, sort_order, created_at);

create table if not exists learning_teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  attempt_id uuid not null references learning_diagnostic_attempts(id) on delete cascade,
  stage_id text references learning_stages(id),
  teacher_id text references learning_teachers(id),
  scores jsonb not null default '{}'::jsonb,
  status varchar(20) not null default 'pending' check (status in ('assigned', 'pending')),
  reason varchar(300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id)
);

insert into learning_stages (id, code, name, description, conditions, sort_order, status)
values
  ('stage-foundation', 'foundation', '入门期', '适合刚开始建立学习基础的用户', '[{"dimension":"foundation","operator":"lte","value":40}]'::jsonb, 10, 'active'),
  ('stage-system', 'system', '基础期', '适合已经开始系统学习的用户', '[{"dimension":"foundation","operator":"between","value":41,"upperValue":70}]'::jsonb, 20, 'active'),
  ('stage-intensive', 'intensive', '强化期', '适合需要集中强化和复盘的用户', '[{"dimension":"foundation","operator":"gte","value":71}]'::jsonb, 30, 'active')
on conflict (id) do nothing;

insert into learning_teachers (id, stage_id, name, subject, specialty, sort_order, status)
values
  ('teacher-foundation-civil', 'stage-foundation', '张老师', '民法', '擅长基础薄弱、零基础学员的体系入门', 10, 'active'),
  ('teacher-system-criminal', 'stage-system', '李老师', '刑法', '擅长知识体系梳理和案例分析', 10, 'active'),
  ('teacher-intensive-general', 'stage-intensive', '王老师', '综合', '擅长强化训练、错题复盘和考前提分', 10, 'active')
on conflict (id) do nothing;

insert into admin_permissions (code, name) values
  ('learning.stages.read', '查看学习阶段和师资'),
  ('learning.stages.write', '创建和编辑学习阶段和师资')
on conflict (code) do nothing;

insert into admin_role_permissions (role_id, permission_code)
select r.id, p.code from admin_roles r cross join admin_permissions p
where r.code = 'learning_admin' and p.code in ('learning.stages.read', 'learning.stages.write')
on conflict do nothing;
