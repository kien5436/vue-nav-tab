import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from '../lib/utils/debounce';

describe('debounce', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // the debounced function types `this` as itself, so tests invoke it explicitly
  function invoke(debounced: ReturnType<typeof debounce>, arg: string) {
    debounced.call(debounced, arg);
  }

  it('invokes once after the wait with the leading call args', () => {
    // the shipped debounce schedules on the first call of a burst and never reschedules,
    // so the trailing invocation replays the first args; the migration preserves this
    const func = vi.fn();
    const debounced = debounce(func, 250);

    invoke(debounced, 'a');
    invoke(debounced, 'b');
    invoke(debounced, 'c');
    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('a');
  });

  it('invokes on the leading edge when immediate is set', () => {
    const func = vi.fn();
    const debounced = debounce(func, 250, true);

    invoke(debounced, 'a');
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('a');

    invoke(debounced, 'b');
    vi.advanceTimersByTime(250);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('drops a pending call on cancel', () => {
    const func = vi.fn();
    const debounced = debounce(func, 250);

    invoke(debounced, 'a');
    debounced.cancel();
    vi.advanceTimersByTime(250);
    expect(func).not.toHaveBeenCalled();
  });
});
