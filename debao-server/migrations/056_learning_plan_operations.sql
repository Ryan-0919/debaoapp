-- Operational controls for user pauses and automatic schedule rebalance.
create index if not exists learning_plans_pause_idx on learning_plans (user_id, paused_until);
alter table learning_plan_versions drop constraint if exists learning_plan_versions_source_check;
alter table learning_plan_versions add constraint learning_plan_versions_source_check check (source in ('auto', 'admin', 'publish', 'user'));
