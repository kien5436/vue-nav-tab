import { DOMWrapper, mount } from '@vue/test-utils';
import { h } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';

import XScrollbar from '../lib/components/XScrollbar.vue';
import YScrollbar from '../lib/components/YScrollbar.vue';
import { trackMounted, unmountAll } from './helpers';

afterEach(() => {
  unmountAll();
});

function setMeasurements(el: Element, values: Record<string, number>) {
  Object.entries(values).forEach(([key, value]) => {
    Object.defineProperty(el, key, { configurable: true, value, writable: true });
  });
}

function thumbOf(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.vp-bg-zinc-400');
}

function trackOf(wrapper: ReturnType<typeof mount>) {
  const track = thumbOf(wrapper).element.parentElement?.children[0];

  expect(track).toBeDefined();

  return new DOMWrapper(track as Element);
}

describe('XScrollbar', () => {

  function mountX() {
    return trackMounted(mount(XScrollbar, { slots: { default: () => h('div', 'content') } }));
  }

  function overflowing() {
    const wrapper = mountX();

    setMeasurements(wrapper.find('.vp-scroller').element, { clientWidth: 200, scrollLeft: 0, scrollWidth: 1000 });

    return wrapper;
  }

  it('hides the thumb until the pointer enters with overflow', async () => {
    const wrapper = overflowing();
    const container = () => thumbOf(wrapper).element.parentElement as HTMLElement | null;

    expect(container()?.style.display).toBe('none');

    await wrapper.trigger('mouseenter');

    expect(container()?.style.display).not.toBe('none');
    expect(thumbOf(wrapper).attributes('style')).toContain('width: 20%');

    await wrapper.trigger('mouseleave');

    expect(container()?.style.display).toBe('none');
  });

  it('stays hidden without overflow', async () => {
    const wrapper = mountX();

    setMeasurements(wrapper.find('.vp-scroller').element, { clientWidth: 200, scrollLeft: 0, scrollWidth: 200 });
    await wrapper.trigger('mouseenter');

    expect(thumbOf(wrapper).element.parentElement?.style.display).toBe('none');
  });

  it('scrolls to the clicked track position', async () => {
    const wrapper = overflowing();
    const trackEl = trackOf(wrapper).element as HTMLElement;

    trackEl.getBoundingClientRect = () => ({ left: 100, width: 400 }) as unknown as DOMRect;
    await trackOf(wrapper).trigger('click', { clientX: 300 });

    expect(wrapper.find('.vp-scroller').element.scrollLeft).toBe(400);
  });

  it('drags the thumb and releases on mouseup', async () => {
    const wrapper = overflowing();

    await wrapper.trigger('mouseenter');
    await thumbOf(wrapper).trigger('mousedown', { clientX: 100 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));

    expect(wrapper.find('.vp-scroller').element.scrollLeft).toBe(250);

    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 300 }));

    expect(wrapper.find('.vp-scroller').element.scrollLeft).toBe(250);
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });
});

describe('YScrollbar', () => {

  function mountY() {
    return trackMounted(mount(YScrollbar, { slots: { default: () => h('div', 'content') } }));
  }

  function overflowing() {
    const wrapper = mountY();

    setMeasurements(wrapper.find('.vp-scroller').element, { clientHeight: 200, scrollHeight: 1000, scrollTop: 0 });

    return wrapper;
  }

  it('hides the thumb until the pointer enters with overflow', async () => {
    const wrapper = overflowing();
    const container = () => thumbOf(wrapper).element.parentElement as HTMLElement | null;

    expect(container()?.style.display).toBe('none');

    await wrapper.trigger('mouseenter');

    expect(container()?.style.display).not.toBe('none');
    expect(thumbOf(wrapper).attributes('style')).toContain('height: 20%');

    await wrapper.trigger('mouseleave');

    expect(container()?.style.display).toBe('none');
  });

  it('stays hidden without overflow', async () => {
    const wrapper = mountY();

    setMeasurements(wrapper.find('.vp-scroller').element, { clientHeight: 200, scrollHeight: 200 });
    await wrapper.trigger('mouseenter');

    expect(thumbOf(wrapper).element.parentElement?.style.display).toBe('none');
  });

  it('scrolls to the clicked track position', async () => {
    const wrapper = overflowing();
    const trackEl = trackOf(wrapper).element as HTMLElement;

    trackEl.getBoundingClientRect = () => ({ height: 400, top: 100 }) as unknown as DOMRect;
    await trackOf(wrapper).trigger('click', { clientY: 300 });

    expect(wrapper.find('.vp-scroller').element.scrollTop).toBe(400);
  });

  it('drags the thumb and releases on mouseup', async () => {
    const wrapper = overflowing();

    await wrapper.trigger('mouseenter');
    await thumbOf(wrapper).trigger('mousedown', { clientY: 100 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }));

    expect(wrapper.find('.vp-scroller').element.scrollTop).toBe(250);

    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 300 }));

    expect(wrapper.find('.vp-scroller').element.scrollTop).toBe(250);
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });
});
