create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id text references forum_posts(id),
  comment_id text,
  reporter_user_id uuid references users(id),
  reason text not null,
  status varchar(20) not null default 'pending',
  resolution text,
  reviewed_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists community_reports_status_idx on community_reports(status, created_at desc);
