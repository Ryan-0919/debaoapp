-- High-value refunds require two distinct administrator reviews before approval.
alter table if exists refund_requests
  add column if not exists review_reason text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists first_reviewed_by uuid references admin_users(id),
  add column if not exists first_reviewed_at timestamptz,
  add column if not exists second_reviewed_by uuid references admin_users(id),
  add column if not exists second_reviewed_at timestamptz;

create index if not exists refund_requests_dual_review_idx
  on refund_requests (status, first_reviewed_by, second_reviewed_by);
