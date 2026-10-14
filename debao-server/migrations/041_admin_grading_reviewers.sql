alter table if exists grading_reviews alter column grader_id drop not null;
alter table if exists grading_reviews add column if not exists reviewer_type varchar(20) not null default 'grader';
alter table if exists grading_reviews add column if not exists reviewer_admin_id uuid references admin_users(id);
create index if not exists grading_reviews_reviewer_admin_idx on grading_reviews (reviewer_admin_id) where reviewer_admin_id is not null;
