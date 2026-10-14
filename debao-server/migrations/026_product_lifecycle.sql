-- Keep product publication state in the durable store. Older databases did not
-- have these columns, so both changes are deliberately idempotent.
alter table if exists products
  add column if not exists status varchar(20) not null default 'on_sale';
alter table if exists products
  add column if not exists updated_at timestamptz not null default now();

alter table if exists products
  drop constraint if exists products_status_check;
alter table if exists products
  add constraint products_status_check
  check (status in ('draft', 'on_sale', 'off_sale', 'archived'));
create index if not exists products_status_updated_idx
  on products (status, updated_at desc);
