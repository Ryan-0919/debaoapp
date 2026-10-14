create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username varchar(120) not null unique,
  password_hash text not null,
  display_name varchar(120) not null,
  status varchar(20) not null default 'active',
  mfa_enabled boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  name varchar(120) not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_permissions (
  code varchar(120) primary key,
  name varchar(160) not null
);

create table if not exists admin_user_roles (
  admin_user_id uuid not null references admin_users(id) on delete cascade,
  role_id uuid not null references admin_roles(id) on delete cascade,
  primary key (admin_user_id, role_id)
);

create table if not exists admin_role_permissions (
  role_id uuid not null references admin_roles(id) on delete cascade,
  permission_code varchar(120) not null references admin_permissions(code) on delete cascade,
  primary key (role_id, permission_code)
);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id) on delete cascade,
  token_hash text not null unique,
  csrf_token text not null,
  ip inet,
  user_agent text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references admin_users(id),
  action varchar(120) not null,
  resource_type varchar(120),
  resource_id varchar(160),
  reason text,
  before_summary jsonb,
  after_summary jsonb,
  request_id uuid,
  ip inet,
  user_agent text,
  result varchar(20) not null default 'success',
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_active_idx on admin_sessions (token_hash) where revoked_at is null;
create index if not exists admin_audit_logs_created_idx on admin_audit_logs (created_at desc);
