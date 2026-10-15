alter table if exists content_papers add column if not exists product_id text references products(id) on delete set null;
create index if not exists content_papers_product_idx on content_papers (product_id) where product_id is not null;
