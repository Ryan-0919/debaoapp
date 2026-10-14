import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import SubjectiveAnswerScreen from '../src/screens/questions/SubjectiveAnswerScreen';
import GradingSubmitSuccessScreen from '../src/screens/tools/GradingSubmitSuccessScreen';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
let mockRoute: {params: Record<string, unknown>};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, replace: mockReplace, goBack: mockGoBack}),
  useRoute: () => mockRoute,
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (state: {drafts: Record<string, string>; saveDraft: jest.Mock}) => unknown) => selector({drafts: {}, saveDraft: jest.fn()}),
}));

jest.mock('@/services', () => ({
  gradingService: {
    questions: jest.fn().mockResolvedValue([{id: 'subjective-demo-1', rubricId: 'rubric-demo-civil-1', version: 1, title: '民法案例分析：房屋买卖与租赁', subjectId: 'civil', caseMaterial: '案例材料', subQuestions: [{id: 'sq-1', prompt: '分析法律关系', maxScore: 20}], totalScore: 20, suggestedMinutes: 45, allowedAnswerTypes: ['text']}]),
    submit: jest.fn(),
  },
  questionService: {saveDraft: jest.fn(), submit: jest.fn()},
}));

const mockGradingService = require('@/services').gradingService as {submit: jest.Mock};

beforeEach(() => {
  mockNavigate.mockClear(); mockReplace.mockClear(); mockGoBack.mockClear();
  mockGradingService.submit.mockReset().mockResolvedValue({id: 'gsub-new-1001'});
});

test('grading answer submission opens the success page with submission details', async () => {
  mockRoute = {params: {subjectName: '民法', gradingPaperId: 'grading-paper-civil', gradingQuestionId: 'subjective-demo-1'}};
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {renderer = ReactTestRenderer.create(<SubjectiveAnswerScreen />);});
  await act(async () => {await Promise.resolve();});
  const input = renderer!.root.findByProps({testID: 'subjective-answer-input'});
  await act(() => input.props.onChangeText('完整作答内容'));
  const press = async (testID: string) => {
    const target = renderer!.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(async () => {await target.props.onPress();});
  };
  await press('subjective-answer-next');
  expect(renderer!.root.findAllByProps({testID: 'subjective-submit-dialog'}).length).toBeGreaterThan(0);
  await press('subjective-submit-confirm');
  expect(mockGradingService.submit).toHaveBeenCalledWith(expect.objectContaining({paperId: 'grading-paper-civil', questionId: 'subjective-demo-1'}));
  expect(mockReplace).toHaveBeenCalledWith('GradingSubmitSuccess', {submissionId: 'gsub-new-1001', paperId: 'grading-paper-civil', questionTitle: '民法案例分析：房屋买卖与租赁'});
  expect(mockGoBack).not.toHaveBeenCalled();
  await act(() => renderer!.unmount());
});

test('grading success page links to records, paper and home', async () => {
  mockRoute = {params: {submissionId: 'gsub-new-1001', paperId: 'grading-paper-civil', questionTitle: '民法案例分析：房屋买卖与租赁'}};
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await act(() => {renderer = ReactTestRenderer.create(<GradingSubmitSuccessScreen />);});
  await act(() => renderer!.root.findByProps({testID: 'grading-success-records'}).props.onPress());
  await act(() => renderer!.root.findByProps({testID: 'grading-success-paper'}).props.onPress());
  await act(() => renderer!.root.findByProps({testID: 'grading-success-home'}).props.onPress());
  expect(mockNavigate).toHaveBeenNthCalledWith(1, 'Grading');
  expect(mockNavigate).toHaveBeenNthCalledWith(2, 'GradingPaperDetail', {paperId: 'grading-paper-civil'});
  expect(mockNavigate).toHaveBeenNthCalledWith(3, 'MainTabs', {screen: 'Home'});
  await act(() => renderer!.unmount());
});
