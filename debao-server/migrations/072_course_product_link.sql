alter table if exists courses add column if not exists product_id text references products(id) on delete set null;
