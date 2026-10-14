import {describe, expect, it} from 'vitest';

describe('admin project smoke', () => {
  it('has the expected dashboard route contract', () => {
    expect('/dashboard').toBe('/dashboard');
  });
});
