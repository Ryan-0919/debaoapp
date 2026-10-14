alter table learning_cards add column if not exists recall_items jsonb not null default '[]'::jsonb;
