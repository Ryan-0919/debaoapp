create table if not exists legal_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  legal_document_id text not null references legal_documents(id) on delete cascade,
  document_version integer not null default 1 check (document_version > 0),
  article text not null,
  title text not null,
  content text not null,
  subject_id text,
  effective_from date,
  created_at timestamptz not null default now(),
  unique (user_id, legal_document_id)
);

create index if not exists legal_favorites_user_created_idx
  on legal_favorites (user_id, created_at desc);
