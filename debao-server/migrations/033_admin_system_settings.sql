-- Durable, non-secret administrator settings. Values are stored as text so
-- future settings can use the same table without changing the schema.
create table if not exists admin_system_settings (
  setting_key varchar(120) primary key,
  setting_value text not null,
  updated_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);

create index if not exists admin_system_settings_updated_idx
  on admin_system_settings (updated_at desc);
