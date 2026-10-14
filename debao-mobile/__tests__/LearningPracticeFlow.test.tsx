import React from 'react';
import Renderer, {act} from 'react-test-renderer';
const mockNavigate = jest.fn();
const mockParams = {mode: 'practice', title: '本课练习', learningTaskId: 'practice-task', questionIds: ['assigned-question']};
jest.mock('@react-navigation/native', () => ({useNavigation: () => ({navigate: mockNavigate}), useRoute: () => ({params: mockParams})}));
jest.mock('@/config/environment', () => ({environment: {useMocks: false}}));
jest.mock('@/services', () => ({
  questionService: {createSession: jest.fn(), getSession: jest.fn(), saveSessionAnswer: jest.fn(), submitSession: jest.fn()},
  learningService: {completeTask: jest.fn()},
}));
jest.mock('@/components/AppScreen', () => ({AppScreen: ({children}: React.PropsWithChildren) => children}));
import ObjectiveAnswerScreen from '../src/screens/questions/ObjectiveAnswerScreen';
const {questionService: questions, learningService: learning} = require('@/services') as {
  questionService: Record<string, jest.Mock>; learningService: Record<string, jest.Mock>;
};
let renderer: Renderer.ReactTestRenderer;
async function press(testID: string) {
  const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
  expect(target).toBeDefined();
  await act(async () => { await target.props.onPress(); });
}
beforeEach(async () => {
  jest.resetAllMocks();
  questions.createSession.mockResolvedValue({id: 'session', status: 'in_progress', questionIds: ['assigned-question'], answers: [], questions: [{id: 'assigned-question', stem: '本课考点练习', options: ['甲', '乙'], questionType: 'single', version: 1}]});
  questions.saveSessionAnswer.mockResolvedValue({});
  questions.submitSession.mockResolvedValue({id: 'report'});
  learning.completeTask.mockResolvedValue({status: 'done'});
  await act(async () => {renderer = Renderer.create(<ObjectiveAnswerScreen />);});
});
afterEach(async () => {await act(async () => renderer.unmount());});

test('assigned practice saves answers, submits, then completes the learning task', async () => {
  expect(questions.createSession).toHaveBeenCalledWith(expect.objectContaining({questionIds: ['assigned-question'], mode: 'chapter'}));
  expect(learning.completeTask).not.toHaveBeenCalled();
  await press('objective-option-B');
  expect(questions.saveSessionAnswer).toHaveBeenCalledWith('session', 'assigned-question', ['1']);
  await press('objective-submit-open');
  await press('objective-submit-confirm');
  expect(questions.submitSession).toHaveBeenCalledWith('session', 'objective-submit-session');
  expect(learning.completeTask).toHaveBeenCalledWith('practice-task');
  expect(questions.submitSession.mock.invocationCallOrder[0]).toBeLessThan(learning.completeTask.mock.invocationCallOrder[0]);
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveReport', {sessionId: 'session'});
});

test('submission failure never completes the task and retry reuses the submission key', async () => {
  questions.submitSession.mockRejectedValueOnce(new Error('交卷失败')).mockResolvedValueOnce({id: 'report'});
  await press('objective-option-B');
  await press('objective-submit-open');
  await press('objective-submit-confirm');
  expect(learning.completeTask).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(renderer.root.findAllByProps({testID: 'objective-submit-error'})[0].props.children).toBe('交卷失败');
  await press('objective-submit-confirm');
  expect(questions.submitSession.mock.calls).toEqual([['session', 'objective-submit-session'], ['session', 'objective-submit-session']]);
  expect(learning.completeTask).toHaveBeenCalledTimes(1);
});
