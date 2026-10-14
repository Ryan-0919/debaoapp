create table if not exists learning_question_taxonomy_nodes (
  id text primary key,
  category varchar(20) not null check (category in ('objective', 'subjective')),
  node_type varchar(20) not null check (node_type in ('subject', 'chapter', 'point', 'subpoint')),
  parent_id text references learning_question_taxonomy_nodes(id),
  code varchar(100) not null,
  name varchar(160) not null,
  sort_order integer not null default 0,
  status varchar(20) not null default 'active' check (status in ('active', 'disabled')),
  created_by uuid references admin_users(id),
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, node_type, code)
);
create index if not exists learning_question_taxonomy_parent_idx on learning_question_taxonomy_nodes (category, node_type, parent_id, status, sort_order, name);
insert into learning_question_taxonomy_nodes (id, category, node_type, code, name, sort_order, status) values
  ('objective-subject-civil', 'objective', 'subject', 'civil', '民法', 10, 'active'),
  ('subjective-subject-civil', 'subjective', 'subject', 'civil', '民法', 10, 'active')
on conflict (id) do nothing;
insert into learning_question_taxonomy_nodes (id, category, node_type, parent_id, code, name, sort_order, status) values
  ('objective-chapter-civil-act', 'objective', 'chapter', 'objective-subject-civil', 'civil-act', '民事法律行为', 10, 'active'),
  ('objective-point-civil-act-effect', 'objective', 'point', 'objective-chapter-civil-act', 'civil-act-effect', '民事法律行为的效力', 10, 'active'),
  ('objective-subpoint-civil-act-limited', 'objective', 'subpoint', 'objective-point-civil-act-effect', 'limited-capacity', '限制民事行为能力', 10, 'active'),
  ('subjective-chapter-contract', 'subjective', 'chapter', 'subjective-subject-civil', 'contract', '合同法', 10, 'active'),
  ('subjective-point-contract-termination', 'subjective', 'point', 'subjective-chapter-contract', 'contract-termination', '合同解除与损害赔偿', 10, 'active')
on conflict (id) do nothing;
alter table learning_question_bank_questions add column if not exists subject_id text references learning_question_taxonomy_nodes(id);
alter table learning_question_bank_questions add column if not exists chapter_id text references learning_question_taxonomy_nodes(id);
alter table learning_question_bank_questions add column if not exists point_id text references learning_question_taxonomy_nodes(id);
alter table learning_question_bank_questions add column if not exists subpoint_id text references learning_question_taxonomy_nodes(id);
update learning_question_bank_questions set subject_id='objective-subject-civil', chapter_id='objective-chapter-civil-act', point_id='objective-point-civil-act-effect', subpoint_id='objective-subpoint-civil-act-limited' where id='lqb-demo-objective-1';
update learning_question_bank_questions set subject_id='subjective-subject-civil', chapter_id='subjective-chapter-contract', point_id='subjective-point-contract-termination', subpoint_id=null where id='lqb-demo-subjective-1';
create index if not exists learning_question_bank_taxonomy_question_idx on learning_question_bank_questions (subject_id, chapter_id, point_id, subpoint_id);
