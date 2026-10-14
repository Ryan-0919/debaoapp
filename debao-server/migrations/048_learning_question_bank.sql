create table if not exists learning_question_bank_questions (
  id text primary key,
  category varchar(20) not null check (category in ('objective', 'subjective')),
  question_type varchar(30) not null check (question_type in ('true_false', 'single', 'indeterminate', 'multiple', 'short_answer', 'case_analysis')),
  subject varchar(80) not null,
  column_name varchar(120) not null,
  knowledge_point varchar(160) not null,
  sub_knowledge_point varchar(160),
  difficulty smallint not null check (difficulty between 1 and 5),
  stem text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answers jsonb not null default '[]'::jsonb,
  analysis text not null default '',
  case_material text,
  sub_questions jsonb not null default '[]'::jsonb,
  estimated_minutes integer not null default 2 check (estimated_minutes between 1 and 600),
  source varchar(160),
  source_year integer check (source_year between 1980 and 2200),
  usage_scenes jsonb not null default '["daily_practice"]'::jsonb,
  status varchar(20) not null default 'draft' check (status in ('draft', 'published', 'disabled')),
  version integer not null default 1,
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists learning_question_bank_filter_idx
  on learning_question_bank_questions (category, status, subject, question_type, updated_at desc);
create index if not exists learning_question_bank_knowledge_idx
  on learning_question_bank_questions (subject, column_name, knowledge_point, sub_knowledge_point);

insert into learning_question_bank_questions (
  id, category, question_type, subject, column_name, knowledge_point, sub_knowledge_point,
  difficulty, stem, options, correct_answers, analysis, estimated_minutes, source,
  usage_scenes, status, version, published_at
) values (
  'lqb-demo-objective-1', 'objective', 'single', '民法', '民事法律行为', '民事法律行为的效力', '限制民事行为能力',
  2, '关于限制民事行为能力人实施的民事法律行为，下列说法正确的是？',
  '[{"key":"A","label":"实施的行为一律无效"},{"key":"B","label":"纯获利益的行为有效"},{"key":"C","label":"所有行为均须法定代理人事先同意"},{"key":"D","label":"行为不能被追认"}]'::jsonb,
  '["B"]'::jsonb, '限制民事行为能力人可以独立实施纯获利益的民事法律行为。', 2, '示例题',
  '["diagnostic","daily_practice"]'::jsonb, 'published', 1, now()
) on conflict (id) do nothing;

insert into learning_question_bank_questions (
  id, category, question_type, subject, column_name, knowledge_point, difficulty, stem,
  analysis, case_material, sub_questions, estimated_minutes, source, usage_scenes, status, version, published_at
) values (
  'lqb-demo-subjective-1', 'subjective', 'case_analysis', '民法', '合同法', '合同解除与损害赔偿', 4,
  '请结合案情回答下列问题。', '',
  '甲与乙签订房屋租赁合同，履行过程中因房屋权属变化发生争议。',
  '[{"id":"sq-1","prompt":"乙能否继续履行租赁合同？请说明理由。","referenceAnswer":"乙可以依据买卖不破租赁规则继续履行租赁合同。","analysis":"需写明结论、规则及其在本案中的适用。","score":10},{"id":"sq-2","prompt":"如合同解除，损失应如何承担？","referenceAnswer":"应结合违约责任、因果关系和减损义务确定赔偿范围。","analysis":"需覆盖责任基础和损失范围。","score":10}]'::jsonb,
  25, '示例题', '["stage_test"]'::jsonb, 'published', 1, now()
) on conflict (id) do nothing;
