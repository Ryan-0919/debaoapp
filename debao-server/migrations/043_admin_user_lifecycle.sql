alter table users add column if not exists created_by_admin uuid references admin_users(id);
alter table users add column if not exists deleted_at timestamptz;
alter table users add column if not exists deletion_reason text;
alter table users add column if not exists deleted_by uuid references admin_users(id);

create index if not exists users_active_created_at_idx
  on users (created_at desc)
  where deleted_at is null;

insert into admin_permissions (code, name)
values ('users.write', '新增和删除 App 用户')
on conflict (code) do update set name = excluded.name;

insert into admin_role_permissions (role_id, permission_code)
select id, 'users.write' from admin_roles where code = 'operator'
on conflict do nothing;
