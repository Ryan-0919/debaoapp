create table if not exists admin_login_events (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references admin_users(id) on delete set null,
  username varchar(120) not null,
  success boolean not null,
  reason varchar(120),
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists admin_export_jobs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id),
  resource_type varchar(120) not null,
  filters jsonb not null default '{}'::jsonb,
  status varchar(30) not null default 'queued',
  file_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists admin_import_jobs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id),
  resource_type varchar(120) not null,
  filename varchar(255) not null,
  status varchar(30) not null default 'preflight',
  success_count integer not null default 0,
  warning_count integer not null default 0,
  error_count integer not null default 0,
  error_report_url text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists content_review_records (
  id uuid primary key default gen_random_uuid(),
  resource_type varchar(120) not null,
  resource_id varchar(160) not null,
  from_status varchar(30),
  to_status varchar(30) not null,
  reason text,
  reviewed_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

create table if not exists community_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_type varchar(30) not null,
  target_id varchar(160) not null,
  action varchar(40) not null,
  reason text not null,
  duration_seconds integer,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

create table if not exists notification_templates (
  id uuid primary key default gen_random_uuid(),
  code varchar(120) not null unique,
  channel varchar(30) not null,
  title_template text not null,
  body_template text not null,
  status varchar(20) not null default 'draft',
  updated_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);

create table if not exists push_jobs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references notification_templates(id),
  audience jsonb not null default '{}'::jsonb,
  status varchar(30) not null default 'draft',
  scheduled_at timestamptz,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists admin_login_events_created_idx on admin_login_events (created_at desc);
create index if not exists admin_import_jobs_created_idx on admin_import_jobs (created_at desc);
create index if not exists push_jobs_status_idx on push_jobs (status, scheduled_at);
