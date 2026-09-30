import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';

import HTabs from '../lib/components/HTabs.vue';
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
});
