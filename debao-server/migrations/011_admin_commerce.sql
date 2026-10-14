create table if not exists refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id),
  user_id uuid references users(id),
  reason text not null,
  status varchar(20) not null default 'requested',
  amount numeric(12,2) not null,
  reviewed_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id),
  price numeric(12,2) not null,
  reason text not null,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);
