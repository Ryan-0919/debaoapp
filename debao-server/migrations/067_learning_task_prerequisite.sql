alter table learning_tasks
  add column if not exists prerequisite_task_id text;
