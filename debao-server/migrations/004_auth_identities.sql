create table if not exists user_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider varchar(32) not null,
  provider_user_id text not null,
  union_id text,
  nickname varchar(120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create unique index if not exists user_identities_provider_union_id_unique
  on user_identities (provider, union_id)
  where union_id is not null;

create table if not exists auth_binding_tickets (
  token_hash text primary key,
  provider varchar(32) not null,
  provider_user_id text not null,
  union_id text,
  nickname varchar(120),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists auth_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  event_type varchar(64) not null,
  provider varchar(32),
  device_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists auth_events_user_created_at_idx
  on auth_events (user_id, created_at desc);
