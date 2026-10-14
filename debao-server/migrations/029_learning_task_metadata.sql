-- Keep task completion and subject attribution available to report builders.
alter table if exists learning_tasks
  add column if not exists completed_at timestamptz;
alter table if exists learning_tasks
  add column if not exists subject_id text references subjects(id);
create index if not exists learning_tasks_plan_due_idx on learning_tasks(plan_id, due_date, status);
