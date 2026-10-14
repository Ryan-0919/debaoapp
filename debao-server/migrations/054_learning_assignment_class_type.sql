alter table learning_teacher_assignments add column if not exists class_type_id text;
create index if not exists learning_teacher_assignments_user_created_idx
  on learning_teacher_assignments (user_id, created_at desc);
