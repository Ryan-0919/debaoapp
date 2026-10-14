-- Durable AI telemetry, per-user quota overrides, and worker bookkeeping.
-- Every statement is idempotent so local databases can be upgraded repeatedly.

create table if not exists ai_quota_settings (
  user_id uuid primary key references users(id) on delete cascade,
  daily_limit integer not null default 20 check (daily_limit >= 0),
  monthly_limit integer not null default 300 check (monthly_limit >= daily_limit),
  updated_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);

create table if not exists ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  session_id text references ai_sessions(id) on delete set null,
  message_id text references ai_messages(id) on delete set null,
  provider varchar(80) not null,
  model varchar(160),
  feature varchar(80) not null default 'chat',
  status varchar(24) not null check (status in ('completed', 'failed', 'blocked_quota')),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  cost_minor numeric(14,4) check (cost_minor is null or cost_minor >= 0),
  error_code varchar(120),
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_events_created_idx on ai_usage_events (created_at desc);
create index if not exists ai_usage_events_user_created_idx on ai_usage_events (user_id, created_at desc);

create table if not exists ai_risk_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  session_id text references ai_sessions(id) on delete set null,
  message_id text references ai_messages(id) on delete set null,
  risk varchar(80) not null,
  reason text not null,
  status varchar(24) not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by uuid references admin_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ai_risk_flags_status_created_idx on ai_risk_flags (status, created_at desc);

alter table if exists admin_export_jobs
  add column if not exists row_count integer,
  add column if not exists error_message text,
  add column if not exists content_type varchar(120),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists push_jobs
  add column if not exists attempts integer not null default 0,
  add column if not exists last_error text,
  add column if not exists updated_at timestamptz not null default now();

