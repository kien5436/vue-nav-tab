import { afterEach, describe, expect, it, vi } from 'vitest';

import { debounce } from '../lib/utils/debounce';

afterEach(() => {
  vi.useRealTimers();
});

describe('debounce', () => {

  it('MENU-08: runs once after the wait on rapid trailing calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const run = debounce(fn, 100);

    run.call(run);
    run.call(run);
    run.call(run);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('MENU-08: runs immediately on the leading edge when immediate', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const run = debounce(fn, 100, true);

    run.call(run);
    run.call(run);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('MENU-08: cancel prevents the pending execution', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const run = debounce(fn, 100);

    run.call(run);
    run.cancel();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();
  });

  it('MENU-08: terminates when the callback re-invokes the debounced function', () => {
    vi.useFakeTimers();
    let count = 0;
    const run = debounce(() => {
      count++;

      // Re-enter through the wrapper itself, as the implementation supports.
      if (1 === count) run.call(run);
    }, 100);

    run.call(run);
    vi.advanceTimersByTime(500);

    expect(count).toBe(2);
  });
});
