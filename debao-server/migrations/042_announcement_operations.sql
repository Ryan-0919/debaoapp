alter table announcements add column if not exists is_pinned boolean not null default false;
alter table announcements add column if not exists audience_type varchar(32) not null default 'all';
alter table announcements add column if not exists audience_value varchar(80);
alter table announcements add column if not exists deep_link text;
alter table announcements add column if not exists published_at timestamptz;
alter table announcements add column if not exists withdrawn_at timestamptz;
alter table announcements add column if not exists withdrawal_reason text;
alter table announcements add column if not exists updated_at timestamptz not null default now();

update announcements
set published_at = coalesce(published_at, created_at),
    updated_at = coalesce(updated_at, created_at)
where status = 'published';

create index if not exists announcements_delivery_idx
  on announcements(status, starts_at, ends_at);
create index if not exists announcements_pinned_idx
  on announcements(is_pinned desc, created_at desc);

do $$ begin
  alter table announcements add constraint announcements_status_check
    check (status in ('draft', 'scheduled', 'published', 'withdrawn'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table announcements add constraint announcements_audience_check
    check (audience_type in ('all', 'exam_year'));
exception when duplicate_object then null;
end $$;
