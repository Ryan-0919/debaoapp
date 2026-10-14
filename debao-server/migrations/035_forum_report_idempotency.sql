-- A user may have at most one pending report for a given post.  The API also
-- checks this in memory, but the partial unique index closes the race when
-- multiple app requests reach a PostgreSQL-backed deployment concurrently.
create unique index if not exists community_reports_pending_post_reporter_uidx
  on community_reports (post_id, reporter_user_id)
  where status = 'pending' and post_id is not null and reporter_user_id is not null;
