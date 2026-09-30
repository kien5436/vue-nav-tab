import { mount } from '@vue/test-utils';
import { defineComponent, h, KeepAlive, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';

import BlankTabView from '../lib/components/BlankTabView.vue';
import HTabs from '../lib/components/HTabs.vue';
import TabView from '../lib/components/TabView.vue';
import VTabs from '../lib/components/VTabs.vue';
import { addTab, createTabs, onTabActivated, onTabDeactivated, useCurrentTab, useTabs } from '../lib/hooks/use-operations';
import { makeTab, MsgTitle, MsgView, trackMounted, unmountAll } from './helpers';

afterEach(() => {
  unmountAll();
});

function seedTabs(group: string) {
  return createTabs(group, [
    makeTab('a', { active: true }),
    makeTab('b', { closable: true }),
    makeTab('c', { closable: true }),
  ]);
}

function tabIds(group: string) {
  return useTabs(group).map((tab) => tab.id);
}

describe('HTabs', () => {

  it('renders one tab per entry with stable ids and active state', () => {
    seedTabs('cmp-render');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'cmp-render', tabs: useTabs('cmp-render') } }));
    const tabs = wrapper.findAll('[role="tab"]');

    expect(tabs).toHaveLength(3);
    expect(wrapper.find('#a-tab').exists()).toBe(true);
    expect(wrapper.find('#b-tab').exists()).toBe(true);
    expect(wrapper.find('#c-tab').exists()).toBe(true);
    expect(wrapper.find('#a-tab').classes()).toContain('vp-item-active');
    expect(wrapper.find('#b-tab').classes()).not.toContain('vp-item-active');
  });

  it('moves activation on tab click', async () => {
    seedTabs('cmp-switch');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'cmp-switch', tabs: useTabs('cmp-switch') } }));

    await wrapper.find('#b-tab').trigger('click');

    expect(useCurrentTab('cmp-switch').value.id).toBe('b');
    expect(wrapper.find('#b-tab').classes()).toContain('vp-item-active');
    expect(wrapper.find('#a-tab').classes()).not.toContain('vp-item-active');
  });

  it('keeps state when the active tab is clicked', async () => {
    seedTabs('cmp-noop');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'cmp-noop', tabs: useTabs('cmp-noop') } }));

    await wrapper.find('#a-tab').trigger('click');

    expect(tabIds('cmp-noop')).toEqual(['a', 'b', 'c']);
    expect(useCurrentTab('cmp-noop').value.id).toBe('a');
  });

  it('removes a closable tab through its close button', async () => {
    seedTabs('cmp-close');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'cmp-close', tabs: useTabs('cmp-close') } }));

    await wrapper.find('#b-tab > span').trigger('click');

    expect(tabIds('cmp-close')).toEqual(['a', 'c']);
    expect(wrapper.find('#b-tab').exists()).toBe(false);
  });

  it('renders no close button for pinned tabs', () => {
    seedTabs('cmp-pinned');
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'cmp-pinned', tabs: useTabs('cmp-pinned') } }));

    expect(wrapper.find('#a-tab > span').exists()).toBe(false);
    expect(wrapper.find('#b-tab > span').exists()).toBe(true);
  });

  it('applies pills, top and rounded variants', () => {
    seedTabs('cmp-variant');
    const wrapper = trackMounted(mount(HTabs, { props: { appearance: 'pills', group: 'cmp-variant', position: 'top', rounded: true, tabs: useTabs('cmp-variant') } }));

    expect(wrapper.find('nav').classes()).toContain('vp-pills');
    expect(wrapper.find('nav').classes()).toContain('vp-tabs-bottom');
    expect(wrapper.find('#a-tab').classes()).toContain('vp-rounded-b');
  });

  it('renders component titles with their props', () => {
    createTabs('cmp-title', [makeTab('t', { active: true, title: MsgTitle, titleProps: { label: 'Hello title' } })]);
    const wrapper = trackMounted(mount(HTabs, { props: { group: 'cmp-title', tabs: useTabs('cmp-title') } }));

    expect(wrapper.find('#t-tab .title-comp').text()).toBe('Hello title');
  });
});

describe('VTabs', () => {

  it('renders stacked tabs with positional offsets', () => {
    seedTabs('cmp-vtabs');
    const wrapper = trackMounted(mount(VTabs, { props: { group: 'cmp-vtabs', tabs: useTabs('cmp-vtabs') } }));
    const tabs = wrapper.findAll('[role="tab"]');

    expect(tabs).toHaveLength(3);
    expect(wrapper.find('#b-tab').attributes('style')).toContain('top: 2.5rem');
    expect(wrapper.find('#a-tab').classes()).toContain('vp-item-active');
  });

  it('moves activation on tab click', async () => {
    seedTabs('cmp-vswitch');
    const wrapper = trackMounted(mount(VTabs, { props: { group: 'cmp-vswitch', tabs: useTabs('cmp-vswitch') } }));

    await wrapper.find('#c-tab').trigger('click');

    expect(useCurrentTab('cmp-vswitch').value.id).toBe('c');
  });

  it('rounds vertical tabs and labels menu actions above/below', async () => {
    seedTabs('cmp-vrounded');
    const wrapper = trackMounted(mount(VTabs, { props: { group: 'cmp-vrounded', rounded: true, tabs: useTabs('cmp-vrounded') } }));

    expect(wrapper.find('#a-tab').classes()).toContain('vp-rounded');
    await wrapper.find('#b-tab').trigger('contextmenu', { clientX: 10, clientY: 10 });
    const items = wrapper.findAll('[role="menuitem"]').map((item) => item.text());

    expect(items).toContain('Close to the above');
    expect(items).toContain('Close to the below');
  });
});

describe('TabView', () => {

  function seedViews(group: string) {
    return createTabs(group, [
      { ...makeTab('home', { active: true }), view: MsgView, viewProps: { msg: 'home-msg' } },
      { ...makeTab('about'), view: MsgView, viewProps: { msg: 'about-msg' } },
    ]);
  }

  it('renders the current tab view with its props', () => {
    seedViews('cmp-view');
    const wrapper = trackMounted(mount(TabView, { props: { group: 'cmp-view' } }));

    expect(wrapper.find('.msg-view').text()).toBe('home-msg');
  });

  it('follows activation changes', async () => {
    seedViews('cmp-follow');
    const wrapper = trackMounted(mount(TabView, { props: { group: 'cmp-follow' } }));
    const about = useTabs('cmp-follow').find((tab) => 'about' === tab.id);

    expect(about).toBeDefined();

    if (about) {
      addTab('cmp-follow', { ...about, active: true });
      await nextTick();
    }

    expect(wrapper.find('.msg-view').text()).toBe('about-msg');
  });

  it('keeps iframe views alive and toggles visibility', async () => {
    createTabs('cmp-iframe', [
      { ...makeTab('a', { active: true, hasIframe: true }), view: MsgView, viewProps: { msg: 'frame-a' } },
      { ...makeTab('b'), view: MsgView, viewProps: { msg: 'view-b' } },
    ]);
    const wrapper = trackMounted(mount(TabView, { props: { group: 'cmp-iframe' } }));
    const about = useTabs('cmp-iframe').find((tab) => 'b' === tab.id);

    expect(about).toBeDefined();

    if (about) {
      addTab('cmp-iframe', { ...about, active: true });
      await nextTick();
    }

    const views = wrapper.findAll('.msg-view');
    const frameA = views.find((view) => 'frame-a' === view.text());
    const viewB = views.find((view) => 'view-b' === view.text());

    expect(views).toHaveLength(2);
    expect(frameA?.element.parentElement?.style.display).toBe('none');
    expect(viewB?.element.parentElement?.style.display).not.toBe('none');
    expect(wrapper.find('.msg-view').text()).toBe('view-b');
  });

  it('falls back to the blank view for an empty group', () => {
    createTabs('cmp-blank', []);
    const wrapper = trackMounted(mount(TabView, { props: { group: 'cmp-blank' } }));

    expect(wrapper.findComponent(BlankTabView).exists()).toBe(true);
    expect(wrapper.find('.msg-view').exists()).toBe(false);
  });
});

describe('tab activation hooks', () => {

  it('fires activate and deactivate for keep-alive consumers', async () => {
    seedTabs('cmp-hooks');
    const activated: string[] = [];
    const deactivated: string[] = [];
    const Probe = defineComponent({
      setup() {
        onTabActivated('cmp-hooks', (tab) => {
          activated.push(tab.id);
        });
        onTabDeactivated('cmp-hooks', (tab) => {
          deactivated.push(tab.id);
        });

        return () => h(TabView, { group: 'cmp-hooks' });
      },
    });
    const Root = defineComponent({ render: () => h(KeepAlive, null, { default: () => h(Probe) }) });
    // manually unmounted below, so it stays out of the shared tracker
    const wrapper = mount(Root);

    await nextTick();
    expect(activated).toEqual(['a']);

    wrapper.unmount();
    expect(deactivated).toEqual(['a']);
  });
});
