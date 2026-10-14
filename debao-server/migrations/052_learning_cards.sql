create table if not exists learning_cards (
  id text primary key,
  title varchar(160) not null,
  description varchar(1000),
  content_type varchar(30) not null check (content_type in ('image_gallery', 'html')),
  assets jsonb not null default '[]'::jsonb,
  recall_items jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0 check (sort_order between 0 and 99999),
  status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'disabled')),
  version integer not null default 1,
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists learning_cards_status_sort_idx
  on learning_cards (status, sort_order, updated_at desc);
