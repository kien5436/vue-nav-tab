import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

import VueNavTab from '../lib';
import HTabs from '../lib/components/HTabs.vue';
import VTabs from '../lib/components/VTabs.vue';
import { ContextMenuLocale, defaultLocales } from '../lib/hooks/use-contextmenu';
import { createTabs, useTabs } from '../lib/hooks/use-operations';
import { makeTab, trackMounted, unmountAll } from './helpers';

afterEach(() => {
  unmountAll();
});

function seedMenu(group: string) {
  return createTabs(group, [
    makeTab('a', { active: true, closable: true }),
    makeTab('b', { closable: true }),
    makeTab('c', { closable: true }),
  ]);
}

function tabIds(group: string) {
  return useTabs(group).map((tab) => tab.id);
}

function menuTexts(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[role="menuitem"]').map((item) => item.text());
}

async function openMenu(wrapper: ReturnType<typeof mount>, tabId: string) {
  await wrapper.find(`#${tabId}-tab`).trigger('contextmenu', { clientX: 50, clientY: 50 });
}

async function clickAction(wrapper: ReturnType<typeof mount>, text: string) {
  const item = wrapper.findAll('[role="menuitem"]').find((entry) => text === entry.text());

  expect(item).toBeDefined();
  await item?.trigger('click');
}

function menuDisplay(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.vp-context-menu').attributes('style') ?? '';
}

describe('context menu', () => {

  it('opens on right-click with English actions and screen-reader roles', async () => {
    seedMenu('mnu-open');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-open', tabs: useTabs('mnu-open') } }));

    expect(menuDisplay(wrapper)).toContain('display: none');
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true);

    await openMenu(wrapper, 'b');

    expect(menuDisplay(wrapper)).toContain('display: block');
    expect(menuTexts(wrapper)).toEqual([
      'Reload',
      'Close',
      'Close all',
      'Close others',
      'Close to the left',
      'Close to the right',
    ]);
    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
  });

  it('closes the clicked tab', async () => {
    seedMenu('mnu-close');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-close', tabs: useTabs('mnu-close') } }));

    await openMenu(wrapper, 'b');
    await clickAction(wrapper, 'Close');

    expect(tabIds('mnu-close')).toEqual(['a', 'c']);
    expect(menuDisplay(wrapper)).toContain('display: none');
  });

  it('reloads the clicked tab with a fresh key', async () => {
    seedMenu('mnu-reload');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-reload', tabs: useTabs('mnu-reload') } }));
    const before = useTabs('mnu-reload').find((tab) => 'b' === tab.id)?._key;

    await openMenu(wrapper, 'b');
    await clickAction(wrapper, 'Reload');

    expect(useTabs('mnu-reload').find((tab) => 'b' === tab.id)?._key).not.toBe(before);
  });

  it('closes all tabs except pinned ones', async () => {
    seedMenu('mnu-all');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-all', tabs: useTabs('mnu-all') } }));

    await openMenu(wrapper, 'b');
    await clickAction(wrapper, 'Close all');

    expect(tabIds('mnu-all')).toEqual(['_']);
  });

  it('closes other tabs', async () => {
    seedMenu('mnu-others');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-others', tabs: useTabs('mnu-others') } }));

    await openMenu(wrapper, 'b');
    await clickAction(wrapper, 'Close others');

    expect(tabIds('mnu-others')).toEqual(['b']);
  });

  it('closes tabs to the left and right', async () => {
    seedMenu('mnu-left');
    const left = trackMounted(mount(HTabs, { props: { group: 'mnu-left', tabs: useTabs('mnu-left') } }));

    await openMenu(left, 'b');
    await clickAction(left, 'Close to the left');

    expect(tabIds('mnu-left')).toEqual(['b', 'c']);

    seedMenu('mnu-right');
    const right = trackMounted(mount(HTabs, { props: { group: 'mnu-right', tabs: useTabs('mnu-right') } }));

    await openMenu(right, 'b');
    await clickAction(right, 'Close to the right');

    expect(tabIds('mnu-right')).toEqual(['a', 'b']);
  });

  it('does nothing when a disabled action is clicked', async () => {
    seedMenu('mnu-disabled');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-disabled', tabs: useTabs('mnu-disabled') } }));

    await openMenu(wrapper, 'a');

    const item = wrapper.findAll('[role="menuitem"]').find((entry) => 'Close to the left' === entry.text());

    expect(item?.classes()).toContain('vp-text-gray-400');
    await clickAction(wrapper, 'Close to the left');

    expect(tabIds('mnu-disabled')).toEqual(['a', 'b', 'c']);
  });

  it('disables close for pinned tabs', async () => {
    createTabs('mnu-pinned', [
      makeTab('a', { active: true }),
      makeTab('b', { closable: true }),
    ]);
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-pinned', tabs: useTabs('mnu-pinned') } }));

    await openMenu(wrapper, 'a');
    await clickAction(wrapper, 'Close');

    expect(tabIds('mnu-pinned')).toEqual(['a', 'b']);
  });

  it('dismisses on outside scroll', async () => {
    seedMenu('mnu-scroll');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-scroll', tabs: useTabs('mnu-scroll') } }));

    await openMenu(wrapper, 'b');
    expect(menuDisplay(wrapper)).toContain('display: block');

    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(menuDisplay(wrapper)).toContain('display: none');
  });

  it('dismisses on Escape', async () => {
    seedMenu('mnu-escape');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-escape', tabs: useTabs('mnu-escape') } }));

    await openMenu(wrapper, 'b');
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
    await nextTick();

    expect(menuDisplay(wrapper)).toContain('display: none');
  });

  it('MENU-01: uses above/below wording in vertical navs', async () => {
    seedMenu('mnu-vertical');
    const wrapper = trackMounted(mount(VTabs, { props: { group: 'mnu-vertical', tabs: useTabs('mnu-vertical') } }));

    await openMenu(wrapper, 'b');

    expect(menuTexts(wrapper)).toEqual([
      'Reload',
      'Close',
      'Close all',
      'Close others',
      'Close to the above',
      'Close to the below',
    ]);
  });

  it('MENU-01: disables edge actions on the first and last tabs', async () => {
    seedMenu('mnu-edges');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-edges', tabs: useTabs('mnu-edges') } }));
    const actionClass = (text: string) => wrapper.findAll('[role="menuitem"]').find((entry) => text === entry.text())?.classes() ?? [];

    await openMenu(wrapper, 'a');
    expect(actionClass('Close to the left')).toContain('vp-text-gray-400');
    expect(actionClass('Close to the right')).not.toContain('vp-text-gray-400');

    await openMenu(wrapper, 'c');
    expect(actionClass('Close to the right')).toContain('vp-text-gray-400');
    expect(actionClass('Close to the left')).not.toContain('vp-text-gray-400');

    await openMenu(wrapper, 'b');
    expect(actionClass('Close to the left')).not.toContain('vp-text-gray-400');
    expect(actionClass('Close to the right')).not.toContain('vp-text-gray-400');
  });

  it('MENU-01: opens at the pointer position', async () => {
    seedMenu('mnu-position');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-position', tabs: useTabs('mnu-position') } }));

    await wrapper.find('#b-tab').trigger('contextmenu', { clientX: 50, clientY: 50 });

    expect(menuDisplay(wrapper)).toContain('display: block');
    expect(menuDisplay(wrapper)).toContain('50px');
  });

  it('MENU-03: dismisses on outside click', async () => {
    seedMenu('mnu-outside');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-outside', tabs: useTabs('mnu-outside') } }));

    await openMenu(wrapper, 'b');
    expect(menuDisplay(wrapper)).toContain('display: block');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(menuDisplay(wrapper)).toContain('display: none');
  });

  it('MENU-03: dismisses on nav scroll', async () => {
    seedMenu('mnu-navscroll');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-navscroll', tabs: useTabs('mnu-navscroll') } }));

    await openMenu(wrapper, 'b');
    wrapper.find('.vp-nav').element.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(menuDisplay(wrapper)).toContain('display: none');
  });

  it('MENU-03: dismisses on window resize', async () => {
    seedMenu('mnu-resize');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-resize', tabs: useTabs('mnu-resize') } }));

    await openMenu(wrapper, 'b');
    window.dispatchEvent(new Event('resize'));
    await nextTick();

    expect(menuDisplay(wrapper)).toContain('display: none');
  });

  it('MENU-03: unmounting while open leaves no live listeners', async () => {
    seedMenu('mnu-teardown');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-teardown', tabs: useTabs('mnu-teardown') } }));

    await openMenu(wrapper, 'b');
    wrapper.unmount();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
    await nextTick();
  });

  const de: ContextMenuLocale['de'] = {
    close: 'Schließen',
    closeAbove: 'Oben schließen',
    closeAll: 'Alle schließen',
    closeBelow: 'Unten schließen',
    closeLeft: 'Links schließen',
    closeOthers: 'Andere schließen',
    closeRight: 'Rechts schließen',
    reload: 'Neu laden',
  };

  function setLang(lang: string) {
    document.documentElement.lang = lang;
  }

  function mountWithLocales(group: string, options: ContextMenuLocale) {
    return trackMounted(mount(HTabs, {
      global: { plugins: [[VueNavTab, options]] },
      props: { group, tabs: useTabs(group) },
    }));
  }

  it('MENU-05: shows vi messages and falls back to English for unknown codes', async () => {
    const previousLang = document.documentElement.lang;

    try {
      seedMenu('mnu-vi');
      const wrapper = mountWithLocales('mnu-vi', {});

      setLang('vi');
      await openMenu(wrapper, 'b');
      expect(menuTexts(wrapper)).toEqual([
        'Tải lại',
        'Đóng',
        'Đóng tất cả',
        'Đóng các thẻ khác',
        'Đóng các thẻ bên trái',
        'Đóng các thẻ bên phải',
      ]);

      setLang('xx');
      await openMenu(wrapper, 'b');
      expect(menuTexts(wrapper)).toEqual([
        'Reload',
        'Close',
        'Close all',
        'Close others',
        'Close to the left',
        'Close to the right',
      ]);
    }
    finally {
      setLang(previousLang);
    }
  });

  it('MENU-05: shows custom messages and picks up language changes at the next open', async () => {
    const previousLang = document.documentElement.lang;

    try {
      seedMenu('mnu-custom');
      const wrapper = mountWithLocales('mnu-custom', { de });

      setLang('en');
      await openMenu(wrapper, 'b');
      expect(menuTexts(wrapper)[1]).toBe(defaultLocales.en.close);

      setLang('de');
      await openMenu(wrapper, 'b');
      expect(menuTexts(wrapper)).toEqual([
        'Neu laden',
        'Schließen',
        'Alle schließen',
        'Andere schließen',
        'Links schließen',
        'Rechts schließen',
      ]);
    }
    finally {
      setLang(previousLang);
    }
  });

  it('MENU-07: ignores an unknown action id', async () => {
    seedMenu('mnu-unknown');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-unknown', tabs: useTabs('mnu-unknown') } }));

    await openMenu(wrapper, 'b');
    (wrapper.vm as unknown as { onMenuClick(id: string): void }).onMenuClick('bogus');
    await nextTick();

    expect(tabIds('mnu-unknown')).toEqual(['a', 'b', 'c']);
  });

  it('MENU-08: survives rapid reopen and dismiss across scroll bursts', async () => {
    vi.useFakeTimers();

    try {
      seedMenu('mnu-rapid');
      const wrapper = trackMounted(mount(HTabs, { props: { group: 'mnu-rapid', tabs: useTabs('mnu-rapid') } }));

      async function reopenAndDismiss() {
        await openMenu(wrapper, 'b');
        expect(menuDisplay(wrapper)).toContain('display: block');

        document.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(menuDisplay(wrapper)).toContain('display: none');

        vi.advanceTimersByTime(150);
      }

      await reopenAndDismiss();
      await reopenAndDismiss();
      await reopenAndDismiss();

      await wrapper.find('#b-tab').trigger('click');
      expect(tabIds('mnu-rapid')).toEqual(['a', 'b', 'c']);
    }
    finally {
      vi.useRealTimers();
    }
  });
});
