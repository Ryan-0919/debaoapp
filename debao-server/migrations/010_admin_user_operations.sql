create table if not exists user_restrictions (
  user_id uuid primary key references users(id) on delete cascade,
  restriction_type varchar(40) not null,
  reason text not null,
  expires_at timestamptz,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  lifted_at timestamptz
);

create table if not exists entitlement_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id text references courses(id),
  adjustment_type varchar(20) not null,
  quantity integer not null default 1,
  reason text not null,
  source_reference varchar(160),
  expires_at timestamptz,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  idempotency_key varchar(160) not null unique
);
