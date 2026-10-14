create table if not exists content_papers (
  id text primary key,
  name varchar(200) not null,
  exam_year varchar(4) not null,
  volume varchar(80) not null,
  mode varchar(30) not null,
  duration_minutes integer not null,
  total_score integer not null,
  question_ids jsonb not null default '[]'::jsonb,
  status varchar(20) not null default 'draft',
  version integer not null default 1,
  created_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);
create index if not exists content_papers_status_idx on content_papers (status, updated_at desc);
