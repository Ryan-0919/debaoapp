alter table if exists live_sessions add column if not exists lesson_id text references course_lessons(id) on delete set null;
alter table if exists live_sessions add column if not exists play_url text;
alter table if exists live_sessions add column if not exists recording_url text;
create index if not exists live_sessions_lesson_idx on live_sessions (lesson_id);
