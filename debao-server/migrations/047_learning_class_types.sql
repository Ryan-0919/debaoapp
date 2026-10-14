create table if not exists learning_class_types (
  id text primary key,
  code varchar(80) not null unique,
  name varchar(80) not null,
  product_id text,
  description varchar(240),
  sort_order integer not null default 0,
  status varchar(20) not null default 'active' check (status in ('active', 'disabled')),
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into learning_class_types (id, code, name, product_id, description, sort_order, status)
values ('class-deen-private-coach', 'deen-private-coach', '得恩私教标准班', 'deen-private-coach', '得恩私教标准班型', 10, 'active')
on conflict (id) do nothing;

alter table learning_stages add column if not exists class_type_id text;
update learning_stages set class_type_id = 'class-deen-private-coach' where class_type_id is null;
alter table learning_stages alter column class_type_id set not null;
create index if not exists learning_stages_class_type_order_idx on learning_stages (class_type_id, status, sort_order, created_at);
