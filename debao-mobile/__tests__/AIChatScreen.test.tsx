import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text, TextInput} from 'react-native';
import AIChatScreen from '../src/screens/ai/AIChatScreen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: mockGoBack}),
}));

jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

function press(renderer: ReactTestRenderer.ReactTestRenderer, testID: string) {
  const node = renderer.root.findAll(item => item.props.testID === testID && typeof item.props.onPress === 'function')[0];
  act(() => node.props.onPress());
}

function textValues(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node =>
    Array.isArray(node.props.children) ? node.props.children.join('') : String(node.props.children),
  );
}

describe('AIChatScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGoBack.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  test('matches the prototype quick question, thinking, answer and reset flow', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<AIChatScreen />);});

    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      'AI 答疑',
      '你好！我是得宝法考AI助手，可以帮你解答法考相关问题。',
      '常见问题快速提问',
      '善意取得的三个要件是什么？',
      '诉讼时效与除斥期间有何区别？',
      '合同无效与合同被撤销的区别？',
      '共同犯罪中从犯如何认定？',
    ]));

    press(renderer!, 'ai-quick-善意取得的三个要件是什么？');
    expect(renderer!.root.findAll(node => node.props.testID === 'ai-thinking').length).toBeGreaterThan(0);
    expect(textValues(renderer!)).not.toContain('常见问题快速提问');

    act(() => jest.advanceTimersByTime(1300));
    const rendered = JSON.stringify(renderer!.toJSON());
    expect(rendered).toContain('善意取得的三个要件是什么？');
    expect(rendered).toContain('善意取得的三个构成要件（《民法典》第311条）：');
    expect(rendered).toContain('口诀');
    expect(rendered).toContain('善意 + 合价 + 公示 → 善意取得成立。');

    press(renderer!, 'ai-chat-reset');
    expect(textValues(renderer!)).toContain('常见问题快速提问');
    expect(renderer!.root.findAll(node => String(node.props.testID ?? '').startsWith('ai-message-user-'))).toHaveLength(0);

    act(() => renderer!.unmount());
  });

  test('supports typed generic questions and the back action', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {renderer = ReactTestRenderer.create(<AIChatScreen />);});
    const input = renderer!.root.findByType(TextInput);
    act(() => input.props.onChangeText('侵权责任怎么分析？'));
    press(renderer!, 'ai-chat-send');
    act(() => jest.advanceTimersByTime(1300));

    expect(textValues(renderer!)).toEqual(expect.arrayContaining([
      '侵权责任怎么分析？',
      '关于「侵权责任怎么分析？」的分析思路：',
      '第一步：定性',
      '第三步：结合案情得结论',
    ]));

    const back = renderer!.root.find(node => node.props.accessibilityLabel === '返回');
    act(() => back.props.onPress());
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    act(() => renderer!.unmount());
  });
});
