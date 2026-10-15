create table if not exists learning_inquiries (
  id text primary key,
  user_id uuid not null references users(id),
  report_id text not null references objective_reports(id),
  question_id text not null,
  question_snapshot jsonb not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','answered')),
  reply text,
  teacher_name text,
  replied_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  replied_at timestamptz,
  client_request_id text not null,
  unique(user_id, client_request_id)
);
create index if not exists learning_inquiries_user_created on learning_inquiries(user_id, created_at desc);
alter table learning_question_bank_questions add column if not exists explanation_media_visible boolean not null default true;
