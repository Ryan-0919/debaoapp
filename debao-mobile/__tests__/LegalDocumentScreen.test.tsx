import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import LegalDocumentScreen from '../src/screens/account/LegalDocumentScreen';

const mockGetDocument = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@/config/environment', () => ({environment: {useMocks: false}}));
jest.mock('@/services', () => ({legalService: {getDocument: (...args: unknown[]) => mockGetDocument(...args)}}));
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({params: {document: 'privacy'}}),
  useNavigation: () => ({canGoBack: () => true, goBack: mockGoBack}),
}));
jest.mock('@/components/AppScreen', () => ({
  AppScreen: ({children, testID}: React.PropsWithChildren<{testID?: string}>) => {
    const ReactRuntime = require('react');
    const {View: NativeView} = require('react-native');
    return ReactRuntime.createElement(NativeView, {testID}, children);
  },
}));

function texts(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => {
    const children = node.props.children;
    return Array.isArray(children) ? children.join('') : String(children);
  });
}

describe('LegalDocumentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocument.mockResolvedValue({
      key: 'privacy',
      title: '隐私政策（远端）',
      version: 2,
      updatedAt: '2026-09-01T00:00:00.000Z',
      status: 'published',
      sections: [{title: '远端章节', body: '由服务端返回的最新内容。'}],
    });
  });

  test('loads the versioned document from the service', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => { renderer = ReactTestRenderer.create(<LegalDocumentScreen />); });
    expect(mockGetDocument).toHaveBeenCalledWith('privacy');
    expect(texts(renderer!)).toEqual(expect.arrayContaining(['隐私政策（远端）', '更新日期：2026年9月1日', '远端章节', '由服务端返回的最新内容。']));
    expect(renderer!.root.findAll(node => node.props.testID === 'legal-document-privacy-state-loading')).toHaveLength(0);
    act(() => renderer!.unmount());
  });

  test('does not fall back to fixture content after an error and can retry', async () => {
    mockGetDocument.mockReset();
    mockGetDocument.mockRejectedValueOnce(new Error('服务端不可用')).mockResolvedValueOnce({
      key: 'privacy', title: '隐私政策（恢复）', version: 3, updatedAt: '2026-09-02T00:00:00.000Z', status: 'published',
      sections: [{title: '恢复章节', body: '重试后内容。'}],
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => { renderer = ReactTestRenderer.create(<LegalDocumentScreen />); });
    expect(texts(renderer!)).toEqual(expect.arrayContaining(['服务端不可用', '重新加载']));
    expect(texts(renderer!)).not.toContain('信息收集');
    const retry = renderer!.root.findByProps({testID: 'legal-document-privacy-state-retry'});
    await act(async () => { await retry.props.onPress(); });
    expect(texts(renderer!)).toEqual(expect.arrayContaining(['隐私政策（恢复）', '恢复章节', '重试后内容。']));
    act(() => renderer!.unmount());
  });
});
