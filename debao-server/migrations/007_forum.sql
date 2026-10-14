alter table forum_posts add column if not exists category varchar(20) not null default '经验分享';
alter table forum_posts add column if not exists updated_at timestamptz not null default now();
alter table forum_posts add column if not exists deleted_at timestamptz;

create table if not exists forum_comments (
  id text primary key,
  post_id text not null references forum_posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  body varchar(1000) not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists forum_post_likes (
  post_id text not null references forum_posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists forum_post_favorites (
  post_id text not null references forum_posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists forum_posts_published_created_idx
  on forum_posts (created_at desc, id desc)
  where status = 'published' and deleted_at is null;

create index if not exists forum_posts_user_created_idx
  on forum_posts (user_id, created_at desc);

create index if not exists forum_comments_post_created_idx
  on forum_comments (post_id, created_at asc, id asc)
  where deleted_at is null;

create index if not exists forum_post_favorites_user_created_idx
  on forum_post_favorites (user_id, created_at desc);
