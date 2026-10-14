create table if not exists user_course_progress (
  user_id uuid references users(id) on delete cascade,
  course_id text references courses(id) on delete cascade,
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

insert into user_course_progress (user_id, course_id, progress)
select '00000000-0000-0000-0000-000000000001', id, progress from courses
on conflict (user_id, course_id) do nothing;

create table if not exists user_notification_receipts (
  user_id uuid references users(id) on delete cascade,
  notification_id text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_id)
);
