create table if not exists learning_diagnostic_forms (
  id text primary key,
  title text not null,
  subtitle text,
  description text,
  estimated_minutes integer not null default 5 check (estimated_minutes between 1 and 120),
  submit_label varchar(40) not null default '提交诊断',
  success_title varchar(120) not null default '初始学习画像已生成',
  success_description text not null default '后续会结合你的学习数据持续调整学习方案。',
  status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'disabled')),
  version integer not null default 1,
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists learning_diagnostic_dimensions (
  code varchar(80) primary key,
  label varchar(80) not null,
  description varchar(240),
  color varchar(40),
  sort_order integer not null default 0,
  status varchar(20) not null default 'active' check (status in ('active', 'disabled')),
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into learning_diagnostic_forms (id, title, subtitle, description, estimated_minutes, submit_label, success_title, success_description, status, version, published_at)
values ('initial-assessment', '首次学习诊断', '先了解你，再制定学习方案', '请按真实情况作答。答案没有对错之分，只用于生成你的初始学习画像。', 5, '提交诊断', '初始学习画像已生成', '后续会结合你的学习数据持续调整学习方案。', 'published', 1, now())
on conflict (id) do nothing;

insert into learning_diagnostic_dimensions (code, label, description, color, sort_order, status)
values
  ('foundation', '学习基础', '已有知识与备考经历', 'blue', 10, 'active'),
  ('time', '时间投入', '每天可稳定投入的时间', 'cyan', 20, 'active'),
  ('discipline', '执行能力', '计划执行与拖延风险', 'purple', 30, 'active'),
  ('comprehension', '理解能力', '理解复杂规则和案例的能力', 'geekblue', 40, 'active'),
  ('memory', '记忆能力', '记忆与复习保持情况', 'gold', 50, 'active'),
  ('practice', '练习习惯', '做题、复盘和错题整理习惯', 'green', 60, 'active')
on conflict (code) do nothing;

alter table learning_diagnostic_questions drop constraint if exists learning_diagnostic_questions_dimension_check;
alter table learning_diagnostic_questions drop constraint if exists learning_diagnostic_questions_question_type_check;
alter table learning_diagnostic_questions add column if not exists form_id text;
alter table learning_diagnostic_questions add column if not exists section varchar(120);
alter table learning_diagnostic_questions add column if not exists placeholder varchar(240);
alter table learning_diagnostic_questions add column if not exists validation jsonb not null default '{}'::jsonb;
update learning_diagnostic_questions set form_id = 'initial-assessment' where form_id is null;
alter table learning_diagnostic_questions alter column form_id set not null;
alter table learning_diagnostic_questions alter column form_id set default 'initial-assessment';
alter table learning_diagnostic_questions drop constraint if exists learning_diagnostic_questions_form_fk;
alter table learning_diagnostic_questions add constraint learning_diagnostic_questions_form_fk foreign key (form_id) references learning_diagnostic_forms(id);
alter table learning_diagnostic_questions drop constraint if exists learning_diagnostic_questions_dimension_fk;
alter table learning_diagnostic_questions add constraint learning_diagnostic_questions_dimension_fk foreign key (dimension) references learning_diagnostic_dimensions(code);
alter table learning_diagnostic_questions drop constraint if exists learning_diagnostic_questions_question_type_check;
alter table learning_diagnostic_questions add constraint learning_diagnostic_questions_question_type_check check (question_type in ('single', 'multiple', 'scale', 'text', 'number'));

create index if not exists learning_diagnostic_questions_form_order_idx on learning_diagnostic_questions (form_id, status, sort_order, created_at);
