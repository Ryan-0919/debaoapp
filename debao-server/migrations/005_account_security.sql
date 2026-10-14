alter table users add column if not exists avatar_color varchar(16);
alter table users add column if not exists avatar_url text;

alter table refresh_sessions add column if not exists created_at timestamptz not null default now();
create index if not exists refresh_sessions_user_device_idx
  on refresh_sessions (user_id, device_id, created_at desc);

alter table account_deletion_requests add column if not exists completed_at timestamptz;
create unique index if not exists account_deletion_requests_active_user_unique
  on account_deletion_requests (user_id)
  where cancelled_at is null and completed_at is null;

create table if not exists auth_verification_challenges (
  id uuid primary key default gen_random_uuid(),
  phone varchar(32) not null,
  purpose varchar(32) not null,
  provider_message_id text not null,
  request_ip text,
  device_id text,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  check (purpose in ('login', 'bind_phone', 'change_phone_old', 'change_phone_new', 'delete_account', 'link_identity', 'unlink_identity'))
);

create index if not exists auth_verification_challenges_phone_purpose_idx
  on auth_verification_challenges (phone, purpose, requested_at desc);

create index if not exists auth_verification_challenges_cleanup_idx
  on auth_verification_challenges (expires_at)
  where consumed_at is null;

create index if not exists auth_verification_challenges_ip_requested_idx
  on auth_verification_challenges (request_ip, requested_at desc)
  where request_ip is not null;

create index if not exists auth_verification_challenges_device_requested_idx
  on auth_verification_challenges (device_id, requested_at desc)
  where device_id is not null;
