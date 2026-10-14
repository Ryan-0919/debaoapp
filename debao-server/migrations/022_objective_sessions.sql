-- Objective quiz sessions keep the server-generated question order, answer
-- drafts and immutable report snapshots. Every statement is idempotent.
create table if not exists objective_sessions (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  mode varchar(20) not null check (mode in ('chapter', 'year', 'random', 'exam')),
  title varchar(200) not null,
  subject_id text references subjects(id),
  paper_id text references content_papers(id),
  question_ids jsonb not null default '[]'::jsonb,
  questions_snapshot jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb,
  duration_seconds integer not null check (duration_seconds > 0),
  started_at timestamptz not null,
  expires_at timestamptz not null,
  status varchar(20) not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired')),
  idempotency_key text,
  report_id text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists objective_sessions_user_idempotency_idx
  on objective_sessions(user_id, idempotency_key) where idempotency_key is not null;
create index if not exists objective_sessions_user_status_idx
  on objective_sessions(user_id, status, updated_at desc);

create table if not exists objective_reports (
  id text primary key,
  session_id text not null unique references objective_sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  mode varchar(20) not null,
  title varchar(200) not null,
  total integer not null,
  answered integer not null,
  correct integer not null,
  score integer not null,
  max_score integer not null,
  results jsonb not null default '[]'::jsonb,
  subject_stats jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null
);
create index if not exists objective_reports_user_submitted_idx
  on objective_reports(user_id, submitted_at desc);

alter table objective_sessions add column if not exists report_id text;
alter table objective_sessions add column if not exists idempotency_key text;
