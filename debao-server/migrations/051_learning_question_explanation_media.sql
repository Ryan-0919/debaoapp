alter table learning_question_bank_questions
  add column if not exists explanation_media_type varchar(10)
    check (explanation_media_type in ('audio', 'video')),
  add column if not exists explanation_media_reference text;

alter table learning_question_bank_questions
  drop constraint if exists learning_question_explanation_media_pair_check;

alter table learning_question_bank_questions
  add constraint learning_question_explanation_media_pair_check check (
    (explanation_media_type is null and explanation_media_reference is null)
    or
    (explanation_media_type is not null and length(trim(explanation_media_reference)) > 0)
  );

-- Older published questions without a complete post-answer explanation must be
-- reviewed before they can enter the scheduling pool again.
update learning_question_bank_questions
set status = 'draft', published_at = null, updated_at = now()
where status = 'published' and length(trim(coalesce(analysis, ''))) < 2;
