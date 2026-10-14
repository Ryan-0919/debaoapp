insert into admin_roles (code, name)
values ('grading_admin', '批改管理员')
on conflict (code) do update set name = excluded.name;

insert into admin_permissions (code, name) values
  ('grading.read', '查看批改任务'),
  ('grading.assign', '创建账号并分发批改任务'),
  ('grading.claim', '领取并自行批改任务'),
  ('grading.submit', '提交管理员批改结果'),
  ('grading.publish', '审核、发布和收回批改结果'),
  ('grading.review', '复核批改结果')
on conflict (code) do nothing;

insert into admin_role_permissions (role_id, permission_code)
select r.id, p.code from admin_roles r cross join admin_permissions p
where r.code = 'grading_admin' and p.code like 'grading.%'
on conflict do nothing;
