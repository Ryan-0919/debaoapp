create table if not exists grading_papers (
  id text primary key,
  title varchar(200) not null,
  subject_id text references subjects(id),
  exam_year varchar(12),
  total_score numeric(8,2) not null check (total_score > 0),
  question_ids jsonb not null default '[]'::jsonb,
  status varchar(24) not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table grading_submissions add column if not exists grading_paper_id text references grading_papers(id);
create index if not exists idx_grading_papers_subject_status on grading_papers(subject_id, status);
create index if not exists idx_grading_submissions_paper on grading_submissions(grading_paper_id, created_at desc);
