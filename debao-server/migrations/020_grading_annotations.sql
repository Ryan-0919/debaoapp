alter table grading_reviews
  add column if not exists answer_annotations jsonb not null default '[]'::jsonb,
  add column if not exists missed_point_ids text[] not null default '{}';

alter table grading_reports
  add column if not exists answers_snapshot jsonb not null default '[]'::jsonb,
  add column if not exists answer_annotations jsonb not null default '[]'::jsonb,
  add column if not exists missed_point_ids text[] not null default '{}';
