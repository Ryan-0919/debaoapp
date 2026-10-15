create table if not exists learning_early_access_requests (
  id text primary key,
  user_id uuid not null references users(id),
  plan_id text not null references learning_plans(id),
  requested_through date not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reason text,
  reviewed_by uuid references admin_users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists learning_early_access_user_idx on learning_early_access_requests(user_id, created_at desc);
alter table learning_plans add column if not exists early_unlocked_through date;
