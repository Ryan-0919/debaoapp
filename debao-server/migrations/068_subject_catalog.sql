alter table subjects add column if not exists question_type text not null default 'both';
alter table subjects add column if not exists chapters jsonb not null default '[]'::jsonb;
