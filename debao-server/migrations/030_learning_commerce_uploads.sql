-- Local productization follow-up: variants, order lifecycle, learning events,
-- and attachment preflight metadata. All statements are repeatable.
alter table if exists products
  add column if not exists status varchar(20) not null default 'on_sale';

alter table if exists orders
  add column if not exists sku_id text,
  add column if not exists coupon_code varchar(80),
  add column if not exists discount_amount numeric(12,2) not null default 0,
  add column if not exists expires_at timestamptz,
  add column if not exists closed_at timestamptz,
  add column if not exists refunded_at timestamptz;

create table if not exists product_skus (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  name varchar(160) not null,
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status varchar(20) not null default 'active',
  attributes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists product_skus_product_idx on product_skus(product_id, status);

create table if not exists coupons (
  code varchar(80) primary key,
  discount_type varchar(20) not null,
  discount_value numeric(12,2) not null,
  min_amount numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  usage_limit integer,
  used_count integer not null default 0,
  status varchar(20) not null default 'active'
);

create table if not exists learning_activities (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  kind varchar(20) not null,
  subject_id text references subjects(id),
  course_id text references courses(id),
  task_id text references learning_tasks(id),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  quantity integer not null default 1 check (quantity >= 0),
  idempotency_key varchar(160),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);
create unique index if not exists learning_activities_user_key_idx
  on learning_activities(user_id, idempotency_key) where idempotency_key is not null;
create index if not exists learning_activities_user_time_idx on learning_activities(user_id, occurred_at desc);

create table if not exists attachment_uploads (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  filename varchar(255) not null,
  content_type varchar(100) not null,
  size_bytes bigint not null check (size_bytes > 0),
  sha256 varchar(64),
  status varchar(20) not null default 'pending',
  upload_token_hash varchar(64) not null,
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists attachment_uploads_user_created_idx on attachment_uploads(user_id, created_at desc);

create index if not exists order_events_order_created_idx on order_events(order_id, created_at desc);
