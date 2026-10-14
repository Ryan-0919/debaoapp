-- Keep subject filtering available when upgrading databases created before the
-- content-admin migrations. The initial schema already has this column, so
-- both statements are intentionally idempotent.
alter table questions add column if not exists subject_id text references subjects(id);
create index if not exists questions_subject_status_idx on questions (subject_id, status, updated_at desc);
