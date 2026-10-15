create table if not exists learning_assessment_papers (
  id text primary key,
  title text not null,
  subject_id text not null,
  question_ids jsonb not null default '[]',
  duration_minutes integer not null default 60,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
