-- Preserve objective question choice semantics across restarts. Existing
-- single-choice rows continue to use `answer`; multiple-choice rows store the
-- complete, sorted answer set in `answer_indexes`.
alter table questions add column if not exists answer_indexes jsonb;
alter table questions add column if not exists question_type varchar(20);
update questions
set question_type = case when coalesce(jsonb_array_length(answer_indexes), 0) > 1 then 'multiple' else 'single' end
where question_type is null;
alter table questions drop constraint if exists questions_question_type_check;
alter table questions add constraint questions_question_type_check
  check (question_type is null or question_type in ('single', 'multiple'));
create index if not exists questions_type_status_idx on questions (question_type, status, updated_at desc);

alter table objective_sessions add column if not exists create_idempotency_key text;
alter table objective_sessions add column if not exists submission_idempotency_key text;
create unique index if not exists objective_sessions_user_create_idempotency_idx
  on objective_sessions(user_id, create_idempotency_key) where create_idempotency_key is not null;
create unique index if not exists objective_sessions_user_submission_idempotency_idx
  on objective_sessions(user_id, submission_idempotency_key) where submission_idempotency_key is not null;
