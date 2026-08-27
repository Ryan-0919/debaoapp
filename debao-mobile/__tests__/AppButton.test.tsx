import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {AppButton} from '../src/components/ui';

test('AppButton renders its command and handles a press', async () => {
  const onPress = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await act(() => {
    renderer = ReactTestRenderer.create(
      <AppButton label="开始练习" onPress={onPress} />,
    );
  });

  const button = renderer!.root.findByProps({accessibilityRole: 'button'});
  await act(() => button.props.onPress());

  expect(renderer!.root.findByProps({children: '开始练习'})).toBeTruthy();
  expect(onPress).toHaveBeenCalledTimes(1);
});
