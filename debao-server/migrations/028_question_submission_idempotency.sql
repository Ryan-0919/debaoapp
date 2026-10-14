-- Optional idempotency for standalone objective/subjective submissions. NULL
-- remains allowed for legacy clients that do not send a key.
alter table if exists question_submissions
  add column if not exists idempotency_key text;
create unique index if not exists question_submissions_user_idempotency_idx
  on question_submissions(user_id, idempotency_key)
  where idempotency_key is not null;
