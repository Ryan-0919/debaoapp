import test from 'node:test';
import assert from 'node:assert/strict';
import {assertGradingTransition, canTransitionGrading, gradingAnswerHash, validateRubric} from '../grading.js';

test('grading state machine accepts the expected manual workflow and rejects shortcuts', () => {
  assert.equal(canTransitionGrading('submitted', 'ai_queued'), true);
  assert.equal(canTransitionGrading('ai_failed', 'manual_queued'), true);
  assert.equal(canTransitionGrading('manual_submitted', 'published'), true);
  assert.equal(canTransitionGrading('ai_completed', 'published'), false);
  assert.throws(() => assertGradingTransition('ai_completed', 'published'), /invalid grading transition/);
});

test('rubric validation checks score integrity and answer hashing is stable', () => {
  const errors = validateRubric({totalScore: 20, subQuestions: [{id: 'q1', prompt: '分析', maxScore: 20}], points: [{id: 'p1', title: '结论', description: '给出结论', maxScore: 8, sortOrder: 1, keywords: [], legalReferences: []}]});
  assert.deepEqual(errors, []);
  assert.equal(gradingAnswerHash('q1', 1, [{text: '答案'}]), gradingAnswerHash('q1', 1, [{text: '答案'}]));
  assert.notEqual(gradingAnswerHash('q1', 1, [{text: '答案'}]), gradingAnswerHash('q1', 2, [{text: '答案'}]));
});
