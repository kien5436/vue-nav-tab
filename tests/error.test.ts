import { describe, expect, it } from 'vitest';

import VueNavTabError, { MISSING_REQUIRED_PROPS } from '../lib/utils/error';

describe('VueNavTabError', () => {

  it('carries the given message under the library error name', () => {
    const error = new VueNavTabError('boom');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(VueNavTabError);
    expect(error.name).toBe('VueNavTabError');
    expect(error.message).toBe('boom');
  });

  it('exposes the shared missing-props message', () => {
    expect(MISSING_REQUIRED_PROPS).toBe('Some properties of the tab are missing');
  });
});
