-- Conversation history and notification lifecycle state. This migration is
-- additive so local development databases can be upgraded repeatedly.
create table if not exists ai_sessions (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  title varchar(160) not null,
  client_request_id varchar(160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index if not exists ai_sessions_user_request_idx
  on ai_sessions(user_id, client_request_id) where client_request_id is not null;
create index if not exists ai_sessions_user_updated_idx
  on ai_sessions(user_id, updated_at desc);

create table if not exists ai_messages (
  id text primary key,
  session_id text not null references ai_sessions(id) on delete cascade,
  role varchar(16) not null check (role in ('user', 'assistant')),
  content text not null,
  client_request_id varchar(160),
  created_at timestamptz not null default now()
);
create unique index if not exists ai_messages_session_request_idx
  on ai_messages(session_id, client_request_id) where client_request_id is not null;
create index if not exists ai_messages_session_created_idx
  on ai_messages(session_id, created_at);

alter table if exists learning_activities
  add column if not exists question_id text references questions(id);
create index if not exists learning_activities_question_idx
  on learning_activities(user_id, question_id, occurred_at desc);

alter table if exists user_notification_receipts
  add column if not exists closed_at timestamptz;
create index if not exists user_notification_receipts_user_read_idx
  on user_notification_receipts(user_id, read_at);
