create table if not exists learning_question_bank_versions (
  id text primary key,
  question_id text not null references learning_question_bank_questions(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  unique (question_id, version)
);

create index if not exists learning_question_bank_versions_question_idx
  on learning_question_bank_versions (question_id, version desc);
