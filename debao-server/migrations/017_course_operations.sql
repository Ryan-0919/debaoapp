alter table if exists courses add column if not exists status varchar(20) not null default 'published';
alter table if exists courses add column if not exists updated_at timestamptz not null default now();

create table if not exists course_sections (
  id text primary key,
  course_id text not null references courses(id) on delete cascade,
  title varchar(200) not null,
  sort_order integer not null,
  updated_at timestamptz not null default now()
);
create table if not exists course_lessons (
  id text primary key,
  section_id text not null references course_sections(id) on delete cascade,
  title varchar(200) not null,
  media_kind varchar(20) not null,
  media_reference text,
  duration_seconds integer not null default 0,
  trial_enabled boolean not null default false,
  sort_order integer not null,
  updated_at timestamptz not null default now()
);
create table if not exists live_sessions (
  id text primary key,
  course_id text not null references courses(id),
  title varchar(200) not null,
  teacher varchar(120) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  provider_room_id text,
  status varchar(30) not null default 'scheduled',
  notification_status varchar(30) not null default 'not_required',
  created_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);
alter table if exists grading_submissions add column if not exists assigned_admin_id uuid references admin_users(id);
alter table if exists grading_submissions add column if not exists claimed_at timestamptz;
alter table if exists grading_submissions add column if not exists version integer not null default 1;
create index if not exists grading_submissions_queue_idx on grading_submissions (status, created_at);
