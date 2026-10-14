alter table questions add column if not exists chapter_id text;
alter table questions add column if not exists point_id text;

alter table grading_rubrics add column if not exists chapter_id text;
alter table grading_rubrics add column if not exists point_id text;

alter table admin_import_jobs add column if not exists question_kind varchar(20);
alter table admin_import_jobs add column if not exists import_format varchar(20);
alter table admin_import_jobs add column if not exists subject_id text;
alter table admin_import_jobs add column if not exists chapter_id text;
alter table admin_import_jobs add column if not exists point_id text;
alter table admin_import_jobs add column if not exists valid_records jsonb not null default '[]'::jsonb;
alter table admin_import_jobs add column if not exists errors jsonb not null default '[]'::jsonb;
alter table admin_import_jobs add column if not exists idempotency_key varchar(120);

create index if not exists questions_taxonomy_idx on questions (subject_id, chapter_id, point_id);
create index if not exists grading_rubrics_taxonomy_idx on grading_rubrics (subject_id, chapter_id, point_id);
create unique index if not exists admin_import_jobs_idempotency_idx on admin_import_jobs (idempotency_key) where idempotency_key is not null;
