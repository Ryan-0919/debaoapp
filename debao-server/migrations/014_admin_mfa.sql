alter table if exists admin_users
  add column if not exists mfa_secret_enc text;

create index if not exists admin_users_mfa_enabled_idx on admin_users (mfa_enabled);
