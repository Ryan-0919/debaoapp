import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Alert, Text} from 'react-native';
import type {LearningTask} from '../src/services/contracts';

const mockNavigate = jest.fn();
let mockTaskId = 'course-task';
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: jest.fn()}),
  useRoute: () => ({params: {taskId: mockTaskId}}),
}));
jest.mock('@/config/environment', () => ({environment: {useMocks: false, apiBaseUrl: 'http://localhost/v1'}}));
jest.mock('@/services', () => ({learningService: {tasks: jest.fn(), card: jest.fn(), completeTask: jest.fn()}}));
jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children}: React.PropsWithChildren) => children,
}));
import LearningTaskDetailScreen from '../src/screens/tools/LearningTaskDetailScreen';
const {learningService: service} = require('@/services') as {learningService: Record<string, jest.Mock>};
let renderer: Renderer.ReactTestRenderer | undefined;
const task = (overrides: Partial<LearningTask> = {}): LearningTask => ({
  id: 'course-task', planId: 'plan', title: '民法第一讲', description: '在外部平台听课后回来打卡',
  dueDate: '2026-10-09', minutes: 0, status: 'todo', contentType: 'course', locked: false, ...overrides,
});
const texts = () => renderer!.root.findAllByType(Text).map(node => node.props.children).flat().join(' ');
async function mount(value: LearningTask) {
  mockTaskId = value.id;
  service.tasks.mockResolvedValue([value]);
  await act(async () => { renderer = Renderer.create(<LearningTaskDetailScreen />); });
}
async function press(label: string) {
  const button = renderer!.root.findAll(node => typeof node.props.onPress === 'function').find(node => node.findAllByType(Text).some(text => text.props.children === label));
  expect(button).toBeDefined();
  await act(async () => { await button!.props.onPress(); });
}
beforeEach(() => { jest.clearAllMocks(); service.tasks.mockReset(); service.completeTask.mockReset(); service.card.mockReset(); jest.spyOn(Alert, 'alert').mockImplementation(() => {}); });
afterEach(async () => { if (renderer) await act(async () => renderer!.unmount()); renderer = undefined; jest.restoreAllMocks(); });

test('external lesson shows instructions and check-in sends the correct task ID', async () => {
  service.completeTask.mockResolvedValue(task({status: 'done'}));
  await mount(task());
  expect(texts()).toContain('在外部平台听课后回来打卡');
  await press('听完课程，完成打卡');
  expect(service.completeTask).toHaveBeenCalledWith('course-task');
  expect(texts()).toContain('已完成');
  expect(texts()).not.toContain('听完课程，完成打卡');
});

test.each(['card', 'question'] as const)('locked %s cannot start or appear completed', async contentType => {
  await mount(task({id: 'locked', contentType, contentId: 'content', locked: true}));
  expect(texts()).toContain('完成前置学习内容后解锁');
  expect(texts()).not.toContain('已完成');
  expect(texts()).not.toContain('完成背诵并确认');
  expect(texts()).not.toContain('开始客观题');
  expect(service.card).not.toHaveBeenCalled();
  expect(service.completeTask).not.toHaveBeenCalled();
});

test('unlocked card displays content and confirms memorization', async () => {
  const cardTask = task({id: 'card-task', contentType: 'card', contentId: 'card-civil'});
  service.card.mockResolvedValue({id: 'card-civil', description: '本课民事行为效力背诵要点', contentType: 'image_gallery', assets: []});
  service.completeTask.mockResolvedValue({...cardTask, status: 'done'});
  await mount(cardTask);
  expect(service.card).toHaveBeenCalledWith('card-civil');
  expect(texts()).toContain('本课民事行为效力背诵要点');
  await press('完成背诵并确认');
  expect(service.completeTask).toHaveBeenCalledWith('card-task');
});

test('question starts with only the assigned question and learning task IDs', async () => {
  await mount(task({id: 'practice-task', contentType: 'question', contentId: 'question-civil'}));
  await press('开始客观题');
  expect(mockNavigate).toHaveBeenCalledWith('ObjectiveAnswer', expect.objectContaining({questionIds: ['question-civil'], learningTaskId: 'practice-task'}));
  expect(service.completeTask).not.toHaveBeenCalled();
});

test('failed check-in remains incomplete and can be retried', async () => {
  service.completeTask.mockRejectedValueOnce(new Error('网络连接失败')).mockResolvedValueOnce(task({status: 'done'}));
  await mount(task());
  await press('听完课程，完成打卡');
  expect(Alert.alert).toHaveBeenCalledWith('暂时无法完成', '网络连接失败');
  expect(texts()).not.toContain('已完成');
  await press('听完课程，完成打卡');
  expect(service.completeTask).toHaveBeenCalledTimes(2);
  expect(texts()).toContain('已完成');
});
