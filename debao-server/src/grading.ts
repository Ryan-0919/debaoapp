import {createHash} from 'node:crypto';
import type {GradingRubric, GradingSubmissionStatus} from './types.js';

const transitions: Record<GradingSubmissionStatus, GradingSubmissionStatus[]> = {
  submitted: ['ai_queued', 'cancelled'],
  ai_queued: ['ai_processing', 'ai_failed', 'cancelled'],
  ai_processing: ['ai_completed', 'ai_failed'],
  ai_completed: ['manual_queued'],
  ai_failed: ['ai_queued', 'manual_queued', 'cancelled'],
  manual_queued: ['manual_claimed', 'cancelled'],
  manual_claimed: ['manual_submitted', 'manual_returned', 'manual_expired'],
  manual_submitted: ['supervisor_review', 'published'],
  supervisor_review: ['published', 'manual_queued'],
  manual_returned: ['manual_queued', 'cancelled'],
  manual_expired: ['manual_queued', 'cancelled'],
  published: ['appealed'],
  appealed: ['supervisor_review'],
  cancelled: [],
};

export function canTransitionGrading(from: GradingSubmissionStatus, to: GradingSubmissionStatus) {
  return transitions[from].includes(to);
}

export function assertGradingTransition(from: GradingSubmissionStatus, to: GradingSubmissionStatus) {
  if (!canTransitionGrading(from, to)) throw new Error(`invalid grading transition: ${from} -> ${to}`);
}

export function validateRubric(rubric: Pick<GradingRubric, 'totalScore' | 'subQuestions' | 'points'>) {
  const errors: string[] = [];
  const subTotal = rubric.subQuestions.reduce((sum, item) => sum + item.maxScore, 0);
  const pointTotal = rubric.points.reduce((sum, item) => sum + item.maxScore, 0);
  if (!Number.isFinite(rubric.totalScore) || rubric.totalScore <= 0) errors.push('题目总分必须大于 0');
  if (rubric.subQuestions.length === 0) errors.push('至少需要一个小问');
  if (rubric.points.length === 0) errors.push('至少需要一个采分点');
  if (subTotal !== rubric.totalScore) errors.push('小问分值之和必须等于题目总分');
  if (pointTotal > rubric.totalScore) errors.push('采分点分值之和不能超过题目总分');
  if (rubric.points.some(item => !item.title.trim() || !item.description.trim() || item.maxScore <= 0)) errors.push('采分点名称、得分条件和分值必须完整');
  return errors;
}

export function gradingAnswerHash(questionId: string, questionVersion: number, answers: unknown) {
  return createHash('sha256').update(JSON.stringify({questionId, questionVersion, answers})).digest('hex');
}
