create table if not exists learning_diagnostic_questions (
  id text primary key,
  stem text not null,
  description text,
  question_type varchar(20) not null check (question_type in ('single', 'multiple')),
  dimension varchar(40) not null check (dimension in ('foundation', 'time', 'discipline', 'comprehension', 'memory', 'practice')),
  required boolean not null default true,
  sort_order integer not null default 0,
  status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'disabled')),
  version integer not null default 1,
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists learning_diagnostic_options (
  id text primary key,
  question_id text not null references learning_diagnostic_questions(id) on delete cascade,
  label text not null,
  score integer not null check (score between 0 and 10),
  sort_order integer not null default 0
);

create table if not exists learning_diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  status varchar(20) not null default 'submitted' check (status = 'submitted'),
  question_snapshot jsonb not null,
  answers jsonb not null,
  scores jsonb not null,
  started_at timestamptz not null,
  submitted_at timestamptz not null default now()
);

create index if not exists learning_diagnostic_questions_order_idx
  on learning_diagnostic_questions (status, sort_order, created_at);
create index if not exists learning_diagnostic_attempts_user_idx
  on learning_diagnostic_attempts (user_id, submitted_at desc);

insert into admin_roles (code, name)
values ('learning_admin', '学习中心管理员')
on conflict (code) do update set name = excluded.name;

insert into admin_users (id, username, password_hash, display_name, status, mfa_enabled)
values ('00000000-0000-0000-0000-000000000402', 'learning-admin', 'managed-by-server-config', '学习中心管理员', 'active', false)
on conflict (id) do update set display_name = excluded.display_name, status = 'active';

insert into admin_user_roles (admin_user_id, role_id)
select '00000000-0000-0000-0000-000000000402', id from admin_roles where code = 'learning_admin'
on conflict do nothing;

insert into admin_permissions (code, name) values
  ('dashboard.read', '查看后台基础信息'),
  ('learning.diagnostics.read', '查看学习诊断题'),
  ('learning.diagnostics.write', '创建和编辑学习诊断题'),
  ('learning.diagnostics.publish', '发布和停用学习诊断题'),
  ('learning.users.read', '查看学习中心用户')
on conflict (code) do nothing;

insert into admin_role_permissions (role_id, permission_code)
select r.id, p.code from admin_roles r cross join admin_permissions p
where r.code = 'learning_admin' and (p.code = 'dashboard.read' or p.code like 'learning.%')
on conflict do nothing;

insert into products (id, name, category, price, original_price, sold, accent, benefits, status)
values ('deen-private-coach', '得恩私教', '个性化学习', 1999, 2699, 0, '#4C4BEA', '["首次学习诊断", "专属学习画像", "个性化学习计划"]'::jsonb, 'on_sale')
on conflict (id) do nothing;

insert into product_skus (id, product_id, name, price, stock, status, attributes)
values ('sku-deen-private-coach-standard', 'deen-private-coach', '标准版', 1999, 99999, 'active', '{"版本":"标准版"}'::jsonb)
on conflict (id) do nothing;

insert into orders (id, user_id, product_id, amount, status, client_request_id, sku_id, created_at, paid_at)
values ('DB202609160001', '00000000-0000-0000-0000-000000000001', 'deen-private-coach', 1999, 'paid', 'seed-deen-private-coach', 'sku-deen-private-coach-standard', '2026-09-16T08:00:00Z', '2026-09-16T08:00:00Z')
on conflict (id) do nothing;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = current_schema()
      and table_name = 'learning_diagnostic_questions'
      and column_name = 'form_id'
  ) then
    insert into learning_diagnostic_questions (id, form_id, stem, description, question_type, dimension, required, sort_order, status, version, published_at) values
      ('diagnostic-foundation', 'initial-assessment', '你目前的法考备考基础更接近哪种情况？', '请选择最符合当前真实状态的一项', 'single', 'foundation', true, 10, 'published', 1, now()),
      ('diagnostic-time', 'initial-assessment', '你平均每天可以稳定投入多少学习时间？', null, 'single', 'time', true, 20, 'published', 1, now()),
      ('diagnostic-discipline', 'initial-assessment', '过去一个月，你执行学习计划的情况怎么样？', null, 'single', 'discipline', true, 30, 'published', 1, now())
    on conflict (id) do nothing;
  else
    insert into learning_diagnostic_questions (id, stem, description, question_type, dimension, required, sort_order, status, version, published_at) values
      ('diagnostic-foundation', '你目前的法考备考基础更接近哪种情况？', '请选择最符合当前真实状态的一项', 'single', 'foundation', true, 10, 'published', 1, now()),
      ('diagnostic-time', '你平均每天可以稳定投入多少学习时间？', null, 'single', 'time', true, 20, 'published', 1, now()),
      ('diagnostic-discipline', '过去一个月，你执行学习计划的情况怎么样？', null, 'single', 'discipline', true, 30, 'published', 1, now())
    on conflict (id) do nothing;
  end if;
end $$;

insert into learning_diagnostic_options (id, question_id, label, score, sort_order) values
  ('foundation-0', 'diagnostic-foundation', '刚开始了解法考，还没有系统学习', 0, 10),
  ('foundation-1', 'diagnostic-foundation', '学过部分科目，但知识体系不完整', 1, 20),
  ('foundation-2', 'diagnostic-foundation', '已经完整学习过一轮', 2, 30),
  ('foundation-3', 'diagnostic-foundation', '参加过考试，正在查漏补缺', 3, 40),
  ('time-0', 'diagnostic-time', '不到 1 小时', 0, 10),
  ('time-1', 'diagnostic-time', '1～2 小时', 1, 20),
  ('time-2', 'diagnostic-time', '2～4 小时', 2, 30),
  ('time-3', 'diagnostic-time', '4 小时以上', 3, 40),
  ('discipline-0', 'diagnostic-discipline', '经常拖延，很难开始', 0, 10),
  ('discipline-1', 'diagnostic-discipline', '偶尔学习，容易被打断', 1, 20),
  ('discipline-2', 'diagnostic-discipline', '大多数时候能按计划完成', 2, 30),
  ('discipline-3', 'diagnostic-discipline', '执行稳定，并会主动复盘', 3, 40)
on conflict (id) do nothing;
