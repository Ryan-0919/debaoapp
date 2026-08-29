insert into users (id, name, phone, exam_year, study_days)
values ('00000000-0000-0000-0000-000000000001', '法考学习者', '138****9190', '2026', 126)
on conflict (id) do update set name = excluded.name, exam_year = excluded.exam_year, study_days = excluded.study_days;

insert into subjects (id, name, question_count, color) values
  ('civil', '民法', 2380, '#DDE9FF'), ('criminal', '刑法', 1860, '#FFE0D1'),
  ('admin', '行政法', 960, '#DDF3E4'), ('civil-proc', '民事诉讼法', 1280, '#D9F3EE'),
  ('crim-proc', '刑事诉讼法', 1420, '#FFF0C7'), ('commercial', '商法', 1160, '#F7DDE3'),
  ('economic', '经济法', 880, '#DCEFFF'), ('theory', '理论法', 720, '#DDE9FF')
on conflict (id) do update set name = excluded.name, question_count = excluded.question_count, color = excluded.color;

insert into questions (id, subject_id, stem, options, answer, analysis, type) values
  ('oq1', 'civil', '关于民事法律行为的效力，下列哪一选项是正确的？', '["无民事行为能力人实施的行为一律无效", "限制民事行为能力人实施的纯获利益行为有效", "可撤销行为自始当然无效", "无权代理行为不得追认"]', 1, '限制民事行为能力人可以独立实施纯获利益的民事法律行为。', 'objective'),
  ('oq2', 'civil', '甲将自己的房屋出租给乙，租赁期间将房屋出售给丙。下列说法正确的是？', '["租赁合同自动终止", "乙必须立即搬离", "买卖不破租赁", "丙可以单方提高租金"]', 2, '租赁物在承租人占有期间发生所有权变动，不影响租赁合同效力。', 'objective')
on conflict (id) do update set stem = excluded.stem, options = excluded.options, answer = excluded.answer, analysis = excluded.analysis;

insert into courses (id, title, teacher, type, progress, lessons, accent) values
  ('c1', '民法体系精讲', '张明远', 'video', 68, 42, '#5D7FE8'),
  ('c2', '刑法重点突破', '周子恒', 'audio', 32, 36, '#E27663'),
  ('c3', '主观题每日带练', '王老师', 'live', 12, 30, '#56A878'),
  ('c4', '行政法真题串讲', '陈思源', 'video', 0, 24, '#D59841')
on conflict (id) do update set title = excluded.title, progress = excluded.progress, lessons = excluded.lessons;

insert into products (id, name, category, price, original_price, sold, accent, benefits) values
  ('p1', '2026 法考全程班（主客一体）', '全程备考', 3980, 5200, 2847, '#5D7FE8', '["客观题全科精讲", "主观题批改 20 次", "班主任学习规划"]'),
  ('p2', '主观题案例突破班', '主观题', 1680, 2280, 1536, '#E27663', '["80 个核心案例", "逐题人工批改", "考前模拟 6 套"]'),
  ('p3', '法条音频随身课', '音频课', 299, 399, 4203, '#56A878', '["全科重点法条", "逐字稿配套", "离线能力待接入"]')
on conflict (id) do update set name = excluded.name, price = excluded.price, original_price = excluded.original_price, sold = excluded.sold, benefits = excluded.benefits;
