alter table if exists courses add column if not exists is_hot boolean not null default false;
alter table if exists courses add column if not exists hot_sort_order integer not null default 0;
alter table if exists course_lessons add column if not exists material_category varchar(80);
alter table if exists course_lessons add column if not exists material_kind varchar(20);
alter table if exists course_lessons add column if not exists downloadable boolean not null default false;
alter table if exists course_lessons add column if not exists article_content text;
