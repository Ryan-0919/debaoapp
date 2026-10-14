alter table questions add column if not exists status varchar(20) not null default 'published';
alter table questions add column if not exists version integer not null default 1;
alter table questions add column if not exists updated_at timestamptz not null default now();
alter table questions add column if not exists source text;
alter table legal_documents add column if not exists status varchar(20) not null default 'published';
alter table legal_documents add column if not exists version integer not null default 1;
alter table legal_documents add column if not exists updated_at timestamptz not null default now();
create index if not exists questions_admin_status_idx on questions (status, updated_at desc);
create index if not exists legal_documents_admin_status_idx on legal_documents (status, updated_at desc);
