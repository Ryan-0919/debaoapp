import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReplace = jest.fn();
let mockRouteParams: Record<string, unknown> = {};

jest.mock('@/config/environment', () => ({environment: {useMocks: false}}));
jest.mock('@/services', () => ({
  questionService: {listQuestions: jest.fn(), listRecords: jest.fn(), saveDraft: jest.fn(), submit: jest.fn()},
  gradingService: {list: jest.fn(), papers: jest.fn(), paper: jest.fn(), questions: jest.fn(), report: jest.fn(), submit: jest.fn()},
  learningService: {report: jest.fn()},
  orderService: {list: jest.fn(), get: jest.fn(), create: jest.fn()},
  productService: {list: jest.fn(), get: jest.fn()},
  paymentService: {pay: jest.fn()},
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: mockGoBack, replace: mockReplace, canGoBack: () => true}),
  useRoute: () => ({params: mockRouteParams}),
}));
jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));
jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (state: {drafts: Record<string, string>; saveDraft: jest.Mock}) => unknown) =>
    selector({drafts: {}, saveDraft: jest.fn()}),
}));

import ObjectiveAnswerScreen from '../src/screens/questions/ObjectiveAnswerScreen';
import SubjectiveAnswerScreen from '../src/screens/questions/SubjectiveAnswerScreen';
import GradingPaperDetailScreen from '../src/screens/tools/GradingPaperDetailScreen';
import GradingReportScreen from '../src/screens/tools/GradingReportScreen';
import QuestionRecordsScreen from '../src/screens/tools/QuestionRecordsScreen';
import LearningReportScreen from '../src/screens/tools/LearningReportScreen';
import OrderListScreen from '../src/screens/commerce/OrderListScreen';
import OrderDetailScreen from '../src/screens/commerce/OrderDetailScreen';
import ProductDetailScreen from '../src/screens/commerce/ProductDetailScreen';

const {questionService: mockQuestionService, gradingService: mockGradingService, learningService: mockLearningService, orderService: mockOrderService, productService: mockProductService, paymentService: mockPaymentService} = require('@/services') as {
  questionService: Record<string, jest.Mock>;
  gradingService: Record<string, jest.Mock>;
  learningService: Record<string, jest.Mock>;
  orderService: Record<string, jest.Mock>;
  productService: Record<string, jest.Mock>;
  paymentService: Record<string, jest.Mock>;
};

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    // Async effects chain several state updates (load -> map -> finally).
    // Yield to the next macrotask so all Promise continuations are flushed
    // inside act, avoiding React 19's act(...) warnings without changing
    // production behavior.
    await new Promise<void>(flushResolve => setImmediate(flushResolve));
  });
}

function findPressable(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  expect(node).toBeTruthy();
  return node;
}

async function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  await act(async () => {
    await findPressable(renderer, testID).props.onPress();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(mockQuestionService).forEach(mock => mock.mockReset());
  Object.values(mockGradingService).forEach(mock => mock.mockReset());
  Object.values(mockLearningService).forEach(mock => mock.mockReset());
  Object.values(mockOrderService).forEach(mock => mock.mockReset());
  Object.values(mockProductService).forEach(mock => mock.mockReset());
  Object.values(mockPaymentService).forEach(mock => mock.mockReset());
  mockRouteParams = {};
  mockQuestionService.saveDraft.mockResolvedValue(undefined);
  mockQuestionService.submit.mockResolvedValue({submissionId: 'question-submission'});
});

test('objective answer exposes loading and empty states for an empty remote response', async () => {
  let resolve: (value: unknown) => void = () => undefined;
  mockQuestionService.listQuestions.mockImplementation(() => new Promise(next => { resolve = next; }));
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ObjectiveAnswerScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  expect(renderer!.root.findAllByProps({testID: 'objective-answer-state-loading'}).length).toBeGreaterThan(0);

  await act(async () => {
    resolve({items: []});
    await Promise.resolve();
  });
  expect(renderer!.root.findAllByProps({testID: 'objective-answer-state-empty'}).length).toBeGreaterThan(0);
  await act(() => renderer!.unmount());
});

test('objective answer retries a failed load and only renders remote questions after success', async () => {
  mockQuestionService.listQuestions
    .mockRejectedValueOnce(new Error('题库服务暂时不可用'))
    .mockResolvedValueOnce({items: [{id: 'remote-q1', stem: '远端题干', options: ['甲', '乙'], answer: 0, analysis: '解析'}]});
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ObjectiveAnswerScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'objective-answer-state-error'}).length).toBeGreaterThan(0);
  expect(renderer!.root.findAll(node => node.props.children === '题库服务暂时不可用').length).toBeGreaterThan(0);
  await press(renderer!, 'objective-answer-state-retry');
  await settle();
  expect(renderer!.root.findByProps({testID: 'objective-progress-text'}).props.children.join('')).toBe('1 / 1');
  await act(() => renderer!.unmount());
});

test('objective answer forwards the selected subject to the real question service', async () => {
  mockRouteParams = {subjectId: 'criminal', title: '刑法总论'};
  mockQuestionService.listQuestions.mockResolvedValue({items: []});
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ObjectiveAnswerScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(mockQuestionService.listQuestions).toHaveBeenCalledWith('criminal');
  await act(() => renderer!.unmount());
});

test('subjective grading question retries after a remote failure', async () => {
  mockRouteParams = {subjectName: '民法', gradingPaperId: 'paper-1', gradingQuestionId: 'remote-subjective-1'};
  mockGradingService.questions
    .mockRejectedValueOnce(new Error('批改题目加载失败'))
    .mockResolvedValueOnce([{id: 'remote-subjective-1', rubricId: 'rubric-1', version: 1, title: '远端主观题', subjectId: 'civil', caseMaterial: '案情', subQuestions: [{id: 'sub-1', prompt: '分析', maxScore: 20}], totalScore: 20, suggestedMinutes: 30, allowedAnswerTypes: ['text']}]);
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<SubjectiveAnswerScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'subjective-answer-state-error'}).length).toBeGreaterThan(0);
  await press(renderer!, 'subjective-answer-state-retry');
  await settle();
  expect(renderer!.root.findByProps({testID: 'subjective-answer-input'})).toBeTruthy();
  await act(() => renderer!.unmount());
});

test('subjective submission failure remains on the answer dialog with recovery text', async () => {
  mockRouteParams = {subjectName: '民法', gradingPaperId: 'paper-1', gradingQuestionId: 'remote-subjective-1'};
  mockGradingService.questions.mockResolvedValue([{id: 'remote-subjective-1', rubricId: 'rubric-1', version: 1, title: '远端主观题', subjectId: 'civil', caseMaterial: '案情', subQuestions: [{id: 'sub-1', prompt: '分析', maxScore: 20}], totalScore: 20, suggestedMinutes: 30, allowedAnswerTypes: ['text']}]);
  mockGradingService.submit.mockRejectedValue(new Error('批改服务暂时不可用'));
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<SubjectiveAnswerScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  await act(() => renderer!.root.findByProps({testID: 'subjective-answer-input'}).props.onChangeText('答案内容'));
  await press(renderer!, 'subjective-answer-next');
  await press(renderer!, 'subjective-submit-confirm');
  expect(renderer!.root.findAllByProps({testID: 'subjective-submit-error'}).length).toBeGreaterThan(0);
  expect(mockReplace).not.toHaveBeenCalled();
  await act(() => renderer!.unmount());
});

test('grading paper detail retries and then exposes its remote questions', async () => {
  mockRouteParams = {paperId: 'paper-1'};
  mockGradingService.paper
    .mockRejectedValueOnce(new Error('套卷服务暂时不可用'))
    .mockResolvedValueOnce({id: 'paper-1', title: '远端套卷', subjectId: 'civil', year: '2026', totalScore: 20, questionIds: ['q-1'], questionCount: 1, questions: [{id: 'q-1', rubricId: 'r-1', version: 1, title: '远端题目', subjectId: 'civil', caseMaterial: '案情', subQuestions: [{id: 's-1', prompt: '分析', maxScore: 20}], totalScore: 20, suggestedMinutes: 30, allowedAnswerTypes: ['text']}]});
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<GradingPaperDetailScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'grading-paper-detail-state-error'}).length).toBeGreaterThan(0);
  await press(renderer!, 'grading-paper-detail-state-retry');
  await settle();
  expect(renderer!.root.findByProps({testID: 'grading-paper-question-q-1'})).toBeTruthy();
  await act(() => renderer!.unmount());
});

test('grading report retries after failure and keeps unpublished reports as an empty state', async () => {
  mockRouteParams = {submissionId: 'submission-1'};
  mockGradingService.report
    .mockRejectedValueOnce(new Error('报告服务暂时不可用'))
    .mockResolvedValueOnce(null);
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<GradingReportScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'grading-report-state-error'}).length).toBeGreaterThan(0);
  await press(renderer!, 'grading-report-state-retry');
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'grading-report-state-empty'}).length).toBeGreaterThan(0);
  await act(() => renderer!.unmount());
});

test('question records expose loading and empty states from the real service', async () => {
  let resolve: (value: unknown) => void = () => undefined;
  mockQuestionService.listRecords.mockImplementation(() => new Promise(next => { resolve = next; }));
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<QuestionRecordsScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  expect(renderer!.root.findAllByProps({testID: 'question-records-state-loading'}).length).toBeGreaterThan(0);
  await act(async () => {resolve([]); await Promise.resolve();});
  expect(renderer!.root.findAllByProps({testID: 'question-records-empty'}).length).toBeGreaterThan(0);
  await act(() => renderer!.unmount());
});

test('learning report retries a failed remote load', async () => {
  mockLearningService.report
    .mockRejectedValueOnce(new Error('学习数据暂时不可用'))
    .mockResolvedValueOnce({period: 'week', minutes: 60, answered: 2, correctRate: 50, subjects: [{subjectId: 'civil', minutes: 60, correctRate: 50}]});
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<LearningReportScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'learning-report-state-error'}).length).toBeGreaterThan(0);
  await press(renderer!, 'learning-report-state-retry');
  await settle();
  expect(renderer!.root.findByProps({testID: 'learning-week-hours'})).toBeTruthy();
  await act(() => renderer!.unmount());
});

test('order list does not fall back to prototype rows after a remote failure', async () => {
  mockOrderService.list
    .mockRejectedValueOnce(new Error('订单服务暂时不可用'))
    .mockResolvedValueOnce([{id: 'remote-order', productId: 'p4', productName: '远端直播课程', amount: 680, status: 'paid', createdAt: '2026-09-02T10:00:00.000Z'}]);
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<OrderListScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'order-list-state-error'}).length).toBeGreaterThan(0);
  expect(texts(renderer!)).not.toContain('2024法考全程班（主客一体·视频精讲）');
  await press(renderer!, 'order-list-state-retry');
  await settle();
  expect(texts(renderer!)).toContain('远端直播课程');
  await act(() => renderer!.unmount());
});

test('order detail does not fall back to a prototype order after a remote failure', async () => {
  mockRouteParams = {orderId: 'remote-order'};
  mockOrderService.get
    .mockRejectedValueOnce(new Error('订单详情暂时不可用'))
    .mockResolvedValueOnce({id: 'remote-order', productId: 'p4', productName: '远端直播课程', amount: 680, status: 'pending', createdAt: '2026-09-02T10:00:00.000Z'});
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<OrderDetailScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'order-detail-state-error'}).length).toBeGreaterThan(0);
  expect(texts(renderer!)).not.toContain('2024法考全程班（主客一体·视频精讲）');
  await press(renderer!, 'order-detail-state-retry');
  await settle();
  expect(texts(renderer!)).toEqual(expect.arrayContaining(['远端直播课程', '待开课']));
  await act(() => renderer!.unmount());
});

test('product detail maps remote benefits and keeps fixture content out of the error state', async () => {
  mockRouteParams = {productId: 'p1'};
  mockProductService.get
    .mockResolvedValueOnce({id: 'p1', name: '远端全程班', category: '主客一体', price: 2999, originalPrice: 3999, sold: 9, accent: '#4C4BEA', benefits: ['远端权益一', '远端权益二']});
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ProductDetailScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(texts(renderer!)).toEqual(expect.arrayContaining(['远端全程班', '远端权益一', '远端权益二']));
  await act(() => renderer!.unmount());

  mockProductService.get.mockRejectedValueOnce(new Error('商品服务暂时不可用'));
  await act(async () => { renderer = ReactTestRenderer.create(<ProductDetailScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  expect(renderer!.root.findAllByProps({testID: 'product-detail-state-error'}).length).toBeGreaterThan(0);
  expect(texts(renderer!)).not.toContain('2024法考全程班（主客一体·视频精讲）');
  await act(() => renderer!.unmount());
});

test('product detail recovers from a real payment failure without leaving the confirm button locked', async () => {
  mockRouteParams = {productId: 'p1'};
  mockProductService.get.mockResolvedValue({id: 'p1', name: '远端全程班', category: '主客一体', price: 2999, originalPrice: 3999, sold: 9, accent: '#4C4BEA', benefits: ['远端权益']});
  mockOrderService.create.mockResolvedValue({id: 'remote-order-1', productId: 'p1', productName: '远端全程班', amount: 2999, status: 'pending', createdAt: '2026-09-02T10:00:00.000Z'});
  mockPaymentService.pay
    .mockRejectedValueOnce(new Error('支付服务暂时不可用'))
    .mockResolvedValueOnce({status: 'paid', transactionId: 'txn-1'});

  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => { renderer = ReactTestRenderer.create(<ProductDetailScreen />); await new Promise<void>(flushResolve => setImmediate(flushResolve)); });
  await settle();
  await press(renderer!, 'product-buy');
  await press(renderer!, 'product-purchase-confirm');

  expect(renderer!.root.findByProps({testID: 'product-payment-error'}).props.children).toBe('支付服务暂时不可用');
  expect(renderer!.root.findByProps({testID: 'product-purchase-sheet'})).toBeTruthy();
  expect(renderer!.root.findByProps({testID: 'product-purchase-confirm'}).props.disabled).toBe(false);
  expect(mockReplace).not.toHaveBeenCalled();

  await press(renderer!, 'product-purchase-confirm');
  expect(mockReplace).toHaveBeenCalledWith('PurchaseSuccess', expect.objectContaining({orderId: 'remote-order-1'}));
  await act(() => renderer!.unmount());
});

function texts(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(require('react-native').Text).map(node => {
    const children = node.props.children;
    return Array.isArray(children) ? children.join('') : String(children);
  });
}
