import type {AdminLearningQuestionType} from '@/services/api';

export const objectiveQuestionTypes: Array<{value: AdminLearningQuestionType; label: string}> = [
  {value: 'true_false', label: '判断题'},
  {value: 'single', label: '单选题'},
  {value: 'indeterminate', label: '不定项选择题'},
  {value: 'multiple', label: '多选题'},
];

export const subjectiveQuestionTypes: Array<{value: AdminLearningQuestionType; label: string}> = [
  {value: 'short_answer', label: '简答题'},
  {value: 'case_analysis', label: '案例分析题'},
];

export const learningQuestionTypeLabels: Record<AdminLearningQuestionType, string> = Object.fromEntries(
  [...objectiveQuestionTypes, ...subjectiveQuestionTypes].map(item => [item.value, item.label]),
) as Record<AdminLearningQuestionType, string>;

export function learningQuestionTypeLabel(value: AdminLearningQuestionType) {
  return learningQuestionTypeLabels[value] ?? '未知题型';
}
