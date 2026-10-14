import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import SubjectiveAnswerScreen from '../src/screens/questions/SubjectiveAnswerScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: mockNavigate, goBack: mockGoBack}),
  useRoute: () => ({params: {subjectName: '民法', questionIndex: 2}}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

jest.mock('@/store/useAppStore', () => ({
  ...(() => {
    const saveDraft = jest.fn();
    return {
      useAppStore: (selector: (state: {drafts: Record<string, string>; saveDraft: typeof saveDraft}) => unknown) =>
        selector({drafts: {}, saveDraft}),
      mockSaveLocalDraft: saveDraft,
    };
  })(),
}));

jest.mock('@/services', () => ({
  questionService: {
    saveDraft: jest.fn().mockResolvedValue(undefined),
    submit: jest.fn().mockResolvedValue({submissionId: 'SUB-1'}),
  },
}));

const mockSaveLocalDraft = require('@/store/useAppStore').mockSaveLocalDraft as jest.Mock;
const mockQuestionService = require('@/services').questionService as {
  saveDraft: jest.Mock;
  submit: jest.Mock;
};

test('subjective answer preserves independent answers and implements save, navigation and submit dialog', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const press = async (testID: string) => {
    const target = renderer.root.findAll(node => node.props.testID === testID && typeof node.props.onPress === 'function')[0];
    expect(target).toBeTruthy();
    await act(async () => {await target.props.onPress();});
  };
  const input = () => renderer.root.findByProps({testID: 'subjective-answer-input'});

  await act(() => {renderer = ReactTestRenderer.create(<SubjectiveAnswerScreen />);});
  expect(renderer!.root.findAll(node => node.props.children === '合同解除与违约责任').length).toBeGreaterThan(0);

  await act(() => input().props.onChangeText('第一问答案'));
  expect(input().props.value).toBe('第一问答案');
  expect(renderer!.root.findAll(node => node.props.children === '未保存').length).toBeGreaterThan(0);
  await press('subjective-open-law-search');
  expect(mockSaveLocalDraft).toHaveBeenCalledWith('subjective-q3-0', '第一问答案');
  expect(mockNavigate).toHaveBeenCalledWith('LawSearch', {source: 'subjective-answer', subject: '民法'});
  expect(input().props.value).toBe('第一问答案');
  await press('subjective-answer-save');
  expect(mockSaveLocalDraft).toHaveBeenCalledWith('subjective-q3-0', '第一问答案');
  expect(mockQuestionService.saveDraft).toHaveBeenCalledWith({questionId: 'q3', answers: ['第一问答案', '', '']});

  await press('subjective-answer-subquestion-1');
  expect(input().props.value).toBe('');
  await act(() => input().props.onChangeText('第二问答案'));
  await press('subjective-answer-previous');
  expect(input().props.value).toBe('第一问答案');

  await press('subjective-answer-question-4');
  expect(renderer!.root.findAll(node => node.props.children === '婚姻家庭与继承综合案例').length).toBeGreaterThan(0);
  await press('subjective-answer-subquestion-3');
  expect(renderer!.root.findByProps({testID: 'subjective-answer-next'}).findAll(node => node.props.children === '提交作答').length).toBeGreaterThan(0);
  await press('subjective-answer-next');
  expect(renderer!.root.findAllByProps({testID: 'subjective-submit-dialog'}).length).toBeGreaterThan(0);
  await press('subjective-submit-cancel');
  expect(renderer!.root.findAllByProps({testID: 'subjective-submit-dialog'})).toHaveLength(0);

  await press('subjective-answer-next');
  await press('subjective-submit-confirm');
  expect(mockQuestionService.submit).toHaveBeenCalled();
  expect(mockGoBack).toHaveBeenCalled();

  await act(() => renderer!.unmount());
});
