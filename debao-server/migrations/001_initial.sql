create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(80) not null,
  phone varchar(32) not null unique,
  exam_year varchar(4) not null,
  study_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists refresh_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique, device_id text not null, expires_at timestamptz not null, revoked_at timestamptz
);
create table if not exists devices (
  id text primary key, user_id uuid not null references users(id) on delete cascade,
  platform varchar(16) not null, name varchar(120) not null, push_token text,
  last_seen_at timestamptz not null default now()
);
create table if not exists account_deletion_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  requested_at timestamptz not null default now(), execute_after timestamptz not null, cancelled_at timestamptz
);

create table if not exists subjects (id text primary key, name varchar(80) not null, question_count integer not null default 0, color varchar(16) not null);
create table if not exists questions (id text primary key, subject_id text references subjects(id), stem text not null, options jsonb not null, answer integer, analysis text, type varchar(20) not null default 'objective');
create table if not exists question_drafts (user_id uuid references users(id) on delete cascade, question_id text references questions(id), answers jsonb not null, updated_at timestamptz not null default now(), primary key (user_id, question_id));
create table if not exists question_submissions (id uuid primary key default gen_random_uuid(), user_id uuid references users(id), question_id text references questions(id), answers jsonb not null, score numeric, created_at timestamptz not null default now());
create table if not exists question_records (id uuid primary key default gen_random_uuid(), user_id uuid references users(id), mode varchar(32) not null, title varchar(160) not null, total integer not null, correct integer not null, created_at timestamptz not null default now());
create table if not exists favorites (user_id uuid references users(id) on delete cascade, question_id text references questions(id), created_at timestamptz not null default now(), primary key (user_id, question_id));
create table if not exists mistakes (user_id uuid references users(id) on delete cascade, question_id text references questions(id), wrong_count integer not null default 1, last_answer text, resolved_at timestamptz, primary key (user_id, question_id));

create table if not exists learning_plans (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade,
  title varchar(160) not null, daily_minutes integer not null, start_date date not null, end_date date not null,
  status varchar(20) not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists learning_tasks (
  id uuid primary key default gen_random_uuid(), plan_id uuid references learning_plans(id) on delete cascade,
  title varchar(160) not null, due_date date not null, minutes integer not null, status varchar(20) not null default 'todo', completed_at timestamptz
);

create table if not exists courses (id text primary key, title varchar(160) not null, teacher varchar(80) not null, type varchar(20) not null, progress integer not null default 0, lessons integer not null default 0, accent varchar(16) not null);
create table if not exists course_entitlements (user_id uuid references users(id) on delete cascade, course_id text references courses(id), source_order_id text, expires_at timestamptz, primary key (user_id, course_id));

create table if not exists products (id text primary key, name varchar(160) not null, category varchar(80) not null, price numeric(12,2) not null, original_price numeric(12,2) not null, sold integer not null default 0, accent varchar(16) not null, benefits jsonb not null);
create table if not exists orders (id text primary key, user_id uuid references users(id), product_id text references products(id), amount numeric(12,2) not null, status varchar(20) not null, client_request_id text unique, created_at timestamptz not null default now(), paid_at timestamptz);
create table if not exists order_events (id uuid primary key default gen_random_uuid(), order_id text references orders(id) on delete cascade, event_type varchar(40) not null, payload jsonb not null, created_at timestamptz not null default now());
create table if not exists grading_submissions (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade,
  question_id text references questions(id), file_url text, status varchar(20) not null default 'queued',
  score numeric, feedback text, created_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists announcements (
  id text primary key, title varchar(160) not null, body text not null, status varchar(20) not null default 'draft',
  starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists notification_receipts (
  user_id uuid references users(id) on delete cascade, announcement_id text references announcements(id) on delete cascade,
  read_at timestamptz, primary key (user_id, announcement_id)
);
create table if not exists banners (
  id text primary key, title varchar(160) not null, image_url text not null, target text not null,
  starts_at timestamptz not null, ends_at timestamptz
);
create table if not exists legal_documents (
  id text primary key, title varchar(160) not null, article varchar(160) not null, content text not null,
  effective_from date not null, effective_to date
);
create table if not exists forum_posts (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id), title varchar(160) not null,
  body text not null, likes integer not null default 0, status varchar(20) not null default 'published', created_at timestamptz not null default now()
);
