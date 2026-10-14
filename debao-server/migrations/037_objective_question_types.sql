-- Support all objective question forms used by the admin and app clients.
alter table questions drop constraint if exists questions_question_type_check;
alter table questions add constraint questions_question_type_check
  check (question_type is null or question_type in ('true_false', 'single', 'multiple', 'indeterminate'));
