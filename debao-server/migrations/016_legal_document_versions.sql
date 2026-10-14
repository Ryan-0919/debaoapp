alter table if exists legal_documents add column if not exists document_code varchar(120);
alter table if exists legal_documents add column if not exists source_url text;
alter table if exists legal_documents add column if not exists status varchar(20) not null default 'published';
alter table if exists legal_documents add column if not exists version integer not null default 1;
alter table if exists legal_documents add column if not exists updated_at timestamptz not null default now();
create index if not exists legal_documents_status_idx on legal_documents (status, updated_at desc);
