alter table auth_verification_challenges add column if not exists request_ip text;
alter table auth_verification_challenges add column if not exists device_id text;

create index if not exists auth_verification_challenges_ip_requested_idx
  on auth_verification_challenges (request_ip, requested_at desc)
  where request_ip is not null;

create index if not exists auth_verification_challenges_device_requested_idx
  on auth_verification_challenges (device_id, requested_at desc)
  where device_id is not null;
