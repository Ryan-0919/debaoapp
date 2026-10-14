create table if not exists grading_rubrics (
  id text primary key,
  question_id text not null references questions(id),
  question_version integer not null,
  title varchar(200) not null,
  subject_id text references subjects(id),
  case_material text not null,
  sub_questions jsonb not null,
  grading_basis text not null,
  total_score numeric(8,2) not null check (total_score > 0),
  suggested_minutes integer not null default 60,
  allowed_answer_types jsonb not null default '["text"]'::jsonb,
  status varchar(24) not null default 'draft',
  version_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (question_id, question_version)
);

create table if not exists grading_rubric_points (
  id text primary key,
  rubric_id text not null references grading_rubrics(id) on delete cascade,
  title varchar(200) not null,
  description text not null,
  max_score numeric(8,2) not null check (max_score > 0),
  sort_order integer not null default 0,
  keywords jsonb not null default '[]'::jsonb,
  legal_references jsonb not null default '[]'::jsonb
);

alter table grading_submissions add column if not exists rubric_id text references grading_rubrics(id);
alter table grading_submissions add column if not exists question_version integer;
alter table grading_submissions add column if not exists idempotency_key text;
alter table grading_submissions add column if not exists answer_hash varchar(64);
alter table grading_submissions add column if not exists answers_snapshot jsonb;
alter table grading_submissions add column if not exists ai_failure_reason text;
alter table grading_submissions add column if not exists updated_at timestamptz not null default now();
alter table grading_submissions add column if not exists current_assignment_id text;
alter table grading_submissions add column if not exists latest_report_id text;
create unique index if not exists uq_grading_submission_idempotency on grading_submissions(user_id, idempotency_key) where idempotency_key is not null;

create table if not exists grading_ai_runs (
  id text primary key,
  submission_id text not null references grading_submissions(id) on delete cascade,
  provider varchar(80) not null,
  model varchar(120),
  status varchar(24) not null,
  result jsonb,
  suggested_score numeric(8,2),
  failure_reason text,
  input_tokens integer,
  output_tokens integer,
  cost_minor integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists grader_accounts (
  id uuid primary key default gen_random_uuid(),
  username varchar(80) not null unique,
  display_name varchar(120) not null,
  password_hash text not null,
  status varchar(20) not null default 'active',
  subject_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists grader_sessions (
  id uuid primary key default gen_random_uuid(),
  grader_id uuid not null references grader_accounts(id) on delete cascade,
  token_hash varchar(64) not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists grading_assignments (
  id text primary key,
  submission_id text not null references grading_submissions(id) on delete cascade,
  grader_id uuid references grader_accounts(id),
  status varchar(24) not null default 'available',
  claimed_at timestamptz,
  due_at timestamptz,
  submitted_at timestamptz,
  return_reason text,
  created_at timestamptz not null default now()
);
create unique index if not exists uq_grading_active_assignment on grading_assignments(submission_id) where status in ('available', 'claimed');

create table if not exists grading_reviews (
  id text primary key,
  submission_id text not null references grading_submissions(id) on delete cascade,
  assignment_id text not null references grading_assignments(id),
  grader_id uuid not null references grader_accounts(id),
  total_score numeric(8,2) not null,
  point_results jsonb not null,
  feedback text not null,
  improvement_advice text not null,
  ai_override_reason text,
  status varchar(24) not null default 'submitted',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

create table if not exists grading_reports (
  id text primary key,
  submission_id text not null references grading_submissions(id) on delete cascade,
  review_id text not null references grading_reviews(id),
  version integer not null,
  total_score numeric(8,2) not null,
  max_score numeric(8,2) not null,
  point_results jsonb not null,
  feedback text not null,
  improvement_advice text not null,
  published_by uuid,
  published_at timestamptz not null default now(),
  unique (submission_id, version)
);

create table if not exists grading_events (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null references grading_submissions(id) on delete cascade,
  event_type varchar(80) not null,
  actor_type varchar(20) not null,
  actor_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_grading_events_submission_created on grading_events(submission_id, created_at);
create index if not exists idx_grading_events_type_created on grading_events(event_type, created_at);

create table if not exists grading_credit_accounts (
  user_id uuid primary key references users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists grading_credit_ledger (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  submission_id text not null references grading_submissions(id) on delete cascade,
  delta integer not null,
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, submission_id)
);
