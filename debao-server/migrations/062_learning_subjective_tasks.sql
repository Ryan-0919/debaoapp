-- Allow stage plans to schedule a published subjective question as a learner task.
alter table learning_stage_plan_items
  drop constraint if exists learning_stage_plan_items_content_type_check;
alter table learning_stage_plan_items
  add constraint learning_stage_plan_items_content_type_check
  check (content_type in ('course', 'question', 'subjective', 'assessment', 'card', 'task'));

create table if not exists learning_subjective_submissions (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  task_id text not null,
  question_id text not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (user_id, task_id)
);
create index if not exists learning_subjective_submissions_user_idx
  on learning_subjective_submissions (user_id, submitted_at desc);
