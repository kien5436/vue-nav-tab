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

function nextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
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

  it('SCROLL-02: scrolls to the start and end of the track', async () => {
    const wrapper = overflowing();
    const trackEl = trackOf(wrapper).element as HTMLElement;

    trackEl.getBoundingClientRect = () => ({ left: 100, width: 400 }) as unknown as DOMRect;

    await trackOf(wrapper).trigger('click', { clientX: 100 });
    expect(wrapper.find('.vp-scroller').element.scrollLeft).toBe(0);

    await trackOf(wrapper).trigger('click', { clientX: 500 });
    expect(wrapper.find('.vp-scroller').element.scrollLeft).toBe(800);
  });

  it('SCROLL-02: drags the thumb backwards', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;

    scroller.scrollLeft = 500;
    await wrapper.trigger('mouseenter');
    await thumbOf(wrapper).trigger('mousedown', { clientX: 150 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 }));

    expect(scroller.scrollLeft).toBe(250);

    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });

  it('SCROLL-03: follows browser scrolling on the next animation frame', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;

    scroller.scrollLeft = 400;
    scroller.dispatchEvent(new Event('scroll'));
    await nextFrame();

    expect((thumbOf(wrapper).element as HTMLElement).style.getPropertyValue('left')).toBe('40%');
  });

  // Known defect: no resize listener so the thumb keeps a stale size.
  it.fails('SCROLL-03: refreshes the thumb after viewport resize while visible', async () => {
    const wrapper = overflowing();

    await wrapper.trigger('mouseenter');
    expect(thumbOf(wrapper).attributes('style')).toContain('width: 20%');

    setMeasurements(wrapper.find('.vp-scroller').element, { clientWidth: 500, scrollLeft: 0, scrollWidth: 1000 });
    window.dispatchEvent(new Event('resize'));
    await nextFrame();

    expect(thumbOf(wrapper).attributes('style')).toContain('width: 50%');
  });

  // Known defect: division by zero yields NaN scrollRatio assigned to scrollLeft.
  it.fails('SCROLL-04: keeps finite state with zero measurements', async () => {
    const wrapper = mountX();
    const scroller = wrapper.find('.vp-scroller').element;

    setMeasurements(scroller, { clientWidth: 0, scrollLeft: 0, scrollWidth: 0 });
    await wrapper.trigger('mouseenter');

    expect(thumbOf(wrapper).element.parentElement?.style.display).toBe('none');

    await thumbOf(wrapper).trigger('mousedown', { clientX: 100 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
    document.dispatchEvent(new MouseEvent('mouseup'));

    expect(Number.isFinite(scroller.scrollLeft)).toBe(true);
  });

  // Known defect: division by zero/NaN scrollRatio assigns NaN/Infinity to scrollLeft.
  it.fails('SCROLL-04: tolerates out-of-range and zero-size track clicks', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;
    const trackEl = trackOf(wrapper).element as HTMLElement;

    trackEl.getBoundingClientRect = () => ({ left: 100, width: 400 }) as unknown as DOMRect;
    await trackOf(wrapper).trigger('click', { clientX: 0 });
    await trackOf(wrapper).trigger('click', { clientX: 1000 });
    expect(Number.isFinite(scroller.scrollLeft)).toBe(true);

    trackEl.getBoundingClientRect = () => ({ left: 100, width: 0 }) as unknown as DOMRect;
    await trackOf(wrapper).trigger('click', { clientX: 100 });
    expect(Number.isFinite(scroller.scrollLeft)).toBe(true);
  });

  it('SCROLL-04: cleans up listeners when unmounted mid-drag', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;

    await wrapper.trigger('mouseenter');
    await thumbOf(wrapper).trigger('mousedown', { clientX: 100 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
    wrapper.unmount();

    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 300 }));

    expect(scroller.scrollLeft).toBe(250);
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

  it('SCROLL-02: scrolls to the start and end of the track', async () => {
    const wrapper = overflowing();
    const trackEl = trackOf(wrapper).element as HTMLElement;

    trackEl.getBoundingClientRect = () => ({ height: 400, top: 100 }) as unknown as DOMRect;

    await trackOf(wrapper).trigger('click', { clientY: 100 });
    expect(wrapper.find('.vp-scroller').element.scrollTop).toBe(0);

    await trackOf(wrapper).trigger('click', { clientY: 500 });
    expect(wrapper.find('.vp-scroller').element.scrollTop).toBe(800);
  });

  it('SCROLL-02: drags the thumb backwards', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;

    scroller.scrollTop = 500;
    await wrapper.trigger('mouseenter');
    await thumbOf(wrapper).trigger('mousedown', { clientY: 150 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 100 }));

    expect(scroller.scrollTop).toBe(250);

    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });

  it('SCROLL-03: follows browser scrolling on the next animation frame', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;

    scroller.scrollTop = 400;
    scroller.dispatchEvent(new Event('scroll'));
    await nextFrame();

    expect((thumbOf(wrapper).element as HTMLElement).style.getPropertyValue('top')).toBe('40%');
  });

  // Known defect: no resize listener so the thumb keeps a stale size.
  it.fails('SCROLL-03: refreshes the thumb after viewport resize while visible', async () => {
    const wrapper = overflowing();

    await wrapper.trigger('mouseenter');
    expect(thumbOf(wrapper).attributes('style')).toContain('height: 20%');

    setMeasurements(wrapper.find('.vp-scroller').element, { clientHeight: 500, scrollHeight: 1000, scrollTop: 0 });
    window.dispatchEvent(new Event('resize'));
    await nextFrame();

    expect(thumbOf(wrapper).attributes('style')).toContain('height: 50%');
  });

  // Known defect: division by zero yields NaN scrollRatio assigned to scrollTop.
  it.fails('SCROLL-04: keeps finite state with zero measurements', async () => {
    const wrapper = mountY();
    const scroller = wrapper.find('.vp-scroller').element;

    setMeasurements(scroller, { clientHeight: 0, scrollHeight: 0, scrollTop: 0 });
    await wrapper.trigger('mouseenter');

    expect(thumbOf(wrapper).element.parentElement?.style.display).toBe('none');

    await thumbOf(wrapper).trigger('mousedown', { clientY: 100 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }));
    document.dispatchEvent(new MouseEvent('mouseup'));

    expect(Number.isFinite(scroller.scrollTop)).toBe(true);
  });

  // Known defect: division by zero/NaN scrollRatio assigns NaN/Infinity to scrollTop.
  it.fails('SCROLL-04: tolerates out-of-range and zero-size track clicks', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;
    const trackEl = trackOf(wrapper).element as HTMLElement;

    trackEl.getBoundingClientRect = () => ({ height: 400, top: 100 }) as unknown as DOMRect;
    await trackOf(wrapper).trigger('click', { clientY: 0 });
    await trackOf(wrapper).trigger('click', { clientY: 1000 });
    expect(Number.isFinite(scroller.scrollTop)).toBe(true);

    trackEl.getBoundingClientRect = () => ({ height: 0, top: 100 }) as unknown as DOMRect;
    await trackOf(wrapper).trigger('click', { clientY: 100 });
    expect(Number.isFinite(scroller.scrollTop)).toBe(true);
  });

  it('SCROLL-04: cleans up listeners when unmounted mid-drag', async () => {
    const wrapper = overflowing();
    const scroller = wrapper.find('.vp-scroller').element;

    await wrapper.trigger('mouseenter');
    await thumbOf(wrapper).trigger('mousedown', { clientY: 100 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }));
    wrapper.unmount();

    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 300 }));

    expect(scroller.scrollTop).toBe(250);
    expect(document.body.style.getPropertyValue('user-select')).toBe('');
  });
});
