import { mount } from '@vue/test-utils';
import { defineComponent, h, KeepAlive, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BlankTabView from '../lib/components/BlankTabView.vue';
import HTabs from '../lib/components/HTabs.vue';
import TabView from '../lib/components/TabView.vue';
import VTabs from '../lib/components/VTabs.vue';
import { addTab, createTabs, onTabDeactivated, refreshTab, removeTab, useCurrentTab, useTabs } from '../lib/hooks/use-operations';
import { makeTab, MsgTitle, MsgView, trackMounted, unmountAll } from './helpers';

afterEach(() => {
  unmountAll();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

let groupNumber = 0;

function newGroup() {
  return `components-${++groupNumber}`;
}

function seedTabs(group: string) {
  return createTabs(group, [
    makeTab('a', { active: true, view: MsgView, viewProps: { msg: 'a' } }),
    makeTab('b', { closable: true, view: MsgView, viewProps: { msg: 'b' } }),
    makeTab('c', { closable: true, view: MsgView, viewProps: { msg: 'c' } }),
  ]);
}

async function activate(group: string, id: string) {
  const tab = useTabs(group).find((entry) => entry.id === id)!;

  addTab(group, { ...tab, active: true });
  await nextTick();
}

function expectState(group: string, ids: string[], active: string) {
  const tabs = useTabs(group);

  expect(tabs.map((tab) => tab.id)).toEqual(ids);
  expect(tabs.filter((tab) => tab.active).map((tab) => tab.id)).toEqual([active]);
  expect(useCurrentTab(group).value.id).toBe(active);

  for (const tab of tabs) {
    expect(tab.active).toBe(tab.id === active);
    expect(tab.closable).toBe('a' !== tab.id);
    expect(tab._key).toBe(`${tab.id}~`);
  }
}

describe.each([
  { Component: HTabs, name: 'HTabs' },
  { Component: VTabs, name: 'VTabs' },
])('$name navigation', ({ Component, name }) => {
  it('UI-01/02: renders stable IDs and keeps nav, activation and view in sync', async () => {
    const group = newGroup();
    const tabs = seedTabs(group);
    const nav = trackMounted(mount(Component, { props: { group, tabs } }));
    const view = trackMounted(mount(TabView, { props: { group } }));

    const assertRendered = (ids: string[], active: string) => {
      expectState(group, ids, active);
      expect(nav.get('[role="tablist"]').findAll('[role="tab"]').map((tab) => tab.attributes('id'))).toEqual(ids.map((id) => `${id}-tab`));
      expect(nav.findAll('.vp-item-active').map((tab) => tab.attributes('id'))).toEqual([`${active}-tab`]);
      expect(view.findAll('.msg-view').map((node) => node.text())).toEqual([active]);
    };

    assertRendered(['a', 'b', 'c'], 'a');
    expect(nav.get('nav').classes()).toContain('HTabs' === name ? 'vp-tabs' : 'vp-pills');
    expect(nav.get('#a-tab').classes()).not.toContain('vp-rounded');
    expect(nav.get('#a-tab').classes()).not.toContain('vp-rounded-t');
    expect(nav.get('#a-tab').classes()).not.toContain('vp-rounded-b');

    if ('HTabs' === name) {
      expect(nav.get('nav').classes()).not.toContain('vp-tabs-bottom');
      expect(nav.classes()).toContain('before:vp-bottom-px');
    }

    expect(nav.find('#a-tab > span').exists()).toBe(false);
    expect(nav.find('#b-tab > span').exists()).toBe(true);

    await nav.get('#b-tab > div').trigger('click');
    assertRendered(['a', 'b', 'c'], 'b');
    const before = [...tabs];

    await nav.get('#b-tab').trigger('click');
    assertRendered(['a', 'b', 'c'], 'b');
    tabs.forEach((tab, index) => {
      expect(tab).toBe(before[index]);
    });

    await nav.get('#a-tab').trigger('click');
    assertRendered(['a', 'b', 'c'], 'a');
    await nav.get('#b-tab .vp-icon-x').trigger('click');
    assertRendered(['a', 'c'], 'a');
    await nav.get('#c-tab').trigger('click');
    assertRendered(['a', 'c'], 'c');
    await nav.get('#c-tab > span').trigger('click');
    assertRendered(['a'], 'a');
  });

  it('UI-04: renders string, component and VNode titles with tooltip and props', async () => {
    const group = newGroup();
    const tabs = createTabs(group, [
      makeTab('a', { active: true, hoverTitle: 'More about a', title: 'Plain title', view: MsgView, viewProps: { msg: 'first view' } }),
      makeTab('b', { title: MsgTitle, titleProps: { label: 'Component title' }, view: MsgView, viewProps: { msg: 'second view' } }),
      makeTab('c', { title: h('strong', { class: 'vnode-title' }, 'VNode title') }),
    ]);
    const nav = trackMounted(mount(Component, { props: { group, tabs } }));
    const view = trackMounted(mount(TabView, { props: { group } }));

    expect(nav.get('#a-tab').text()).toBe('Plain title');
    expect(nav.get('#a-tab').attributes('title')).toBe('More about a');
    expect(nav.get('#b-tab .title-comp').text()).toBe('Component title');
    expect(nav.get('#c-tab .vnode-title').text()).toBe('VNode title');
    expect(view.get('.msg-view').text()).toBe('first view');
    await nav.get('#b-tab').trigger('click');
    expect(view.get('.msg-view').text()).toBe('second view');

    // Applications can update an already-open tab after editing its content.
    addTab(group, { ...tabs[1], hoverTitle: 'Updated tooltip', titleProps: { label: 'Updated title' }, viewProps: { msg: 'updated view' } });
    await nextTick();
    expect(nav.get('#b-tab .title-comp').text()).toBe('Updated title');
    expect(nav.get('#b-tab').attributes('title')).toBe('Updated tooltip');
    expect(view.get('.msg-view').text()).toBe('updated view');
    expect(view.findAll('.msg-view')).toHaveLength(1);
    await nav.get('#c-tab').trigger('click');
    expect(view.get('.stub-view').text()).toBe('stub');
    expect(view.find('.msg-view').exists()).toBe(false);
  });

  it('UI-04/SEC-01: treats string titles and tooltips as inert text', () => {
    const group = newGroup();
    const payload = '<img src=x onerror="alert(1)"><script>alert(1)</script>&quot;';
    const tabs = createTabs(group, [makeTab('a', { hoverTitle: payload, title: payload })]);
    const nav = trackMounted(mount(Component, { props: { group, tabs } }));

    expect(nav.get('#a-tab').text()).toBe(payload);
    expect(nav.get('#a-tab').attributes('title')).toBe(payload);
    expect(nav.find('img, script').exists()).toBe(false);
  });
});

describe('navigation variants and layout (UI-03)', () => {
  it('preserves vertical above/below menu labels', async () => {
    const group = newGroup();
    const wrapper = trackMounted(mount(VTabs, { props: { group, tabs: seedTabs(group) } }));

    await wrapper.get('#b-tab').trigger('contextmenu', { clientX: 10, clientY: 10 });
    const labels = wrapper.findAll('[role="menuitem"]').map((item) => item.text());

    expect(labels).toContain('Close to the above');
    expect(labels).toContain('Close to the below');
  });

  it('repositions horizontal tabs when a title update changes measured width', async () => {
    let width = 80;

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      return { width: 'a-tab' === this.id ? width : 120 } as DOMRect;
    });
    const group = newGroup();
    const tabs = seedTabs(group);
    const wrapper = trackMounted(mount(HTabs, { props: { group, tabs } }));

    await nextTick();
    expect((wrapper.get('#b-tab').element as HTMLElement).style.left).toBe('80px');
    width = 160;
    addTab(group, { ...tabs[0], title: 'A longer title' });
    await nextTick();
    await nextTick();
    expect(wrapper.get('#a-tab').text()).toBe('A longer title');
    expect((wrapper.get('#b-tab').element as HTMLElement).style.left).toBe('160px');
    expect((wrapper.get('#c-tab').element as HTMLElement).style.left).toBe('280px');
    expectState(group, ['a', 'b', 'c'], 'a');
  });

  it.each([
    // Four combinations cover each appearance/position/rounded pair.
    ['tabs', 'bottom', true],
    ['tabs', 'top', false],
    ['pills', 'bottom', false],
    ['pills', 'top', true],
  ] as const)('HTabs appearance=%s position=%s rounded=%s', (appearance, position, rounded) => {
    const group = newGroup();
    const tabs = seedTabs(group);
    const wrapper = trackMounted(mount(HTabs, { props: { appearance, group, position, rounded, tabs } }));

    expect(wrapper.get('nav').classes().includes('vp-tabs')).toBe('tabs' === appearance);
    expect(wrapper.get('nav').classes().includes('vp-pills')).toBe('pills' === appearance);
    expect(wrapper.get('nav').classes().includes('vp-tabs-bottom')).toBe('top' === position);
    expect(wrapper.classes().includes(`before:vp-${position}-px`)).toBe('tabs' === appearance);
    expect(wrapper.get('#a-tab').classes().includes('vp-rounded-t')).toBe(rounded && 'bottom' === position);
    expect(wrapper.get('#a-tab').classes().includes('vp-rounded-b')).toBe(rounded && 'top' === position);
  });

  it.each([false, true])('VTabs rounded=%s', (rounded) => {
    const group = newGroup();
    const wrapper = trackMounted(mount(VTabs, { props: { group, rounded, tabs: seedTabs(group) } }));

    expect(wrapper.get('#a-tab').classes().includes('vp-rounded')).toBe(rounded);
  });

  it.each(['appearance', 'position'])('warns for invalid HTabs %s without changing tab state', (prop) => {
    const group = newGroup();
    const warnings: string[] = [];
    const wrapper = trackMounted(mount(HTabs, {
      global: { config: { warnHandler: (message) => warnings.push(message) } },
      props: { group, tabs: seedTabs(group), [prop]: 'invalid' },
    }));

    expect(warnings.some((message) => message.includes('custom validator') && message.includes(prop))).toBe(true);
    expectState(group, ['a', 'b', 'c'], 'a');
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(3);
  });

  it.each([
    { Component: HTabs, name: 'horizontal', offsets: ['0px', '80px', '200px'], property: 'left' },
    { Component: VTabs, name: 'vertical', offsets: ['0rem', '2.5rem', '5rem'], property: 'top' },
  ])('repositions $name tabs after add, close and reorder', async ({ Component, offsets, property }) => {
    const widths: Record<string, number> = { 'a-tab': 80, 'b-tab': 120, 'c-tab': 60, 'd-tab': 90 };

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      return { width: widths[this.id] ?? 0 } as DOMRect;
    });
    const group = newGroup();
    const tabs = seedTabs(group);
    const wrapper = trackMounted(mount(Component, { props: { group, tabs } }));
    const positions = () => wrapper.findAll('[role="tab"]').map((tab) => (tab.element as HTMLElement).style.getPropertyValue(property));

    await nextTick();
    expect(positions()).toEqual(offsets);
    addTab(group, makeTab('d', { closable: true }));
    await nextTick();
    await nextTick();
    expect(positions()).toEqual([...offsets, 'left' === property ? '260px' : '7.5rem']);
    await wrapper.get('#b-tab > span').trigger('click');
    await nextTick();
    expect(positions()).toEqual('left' === property ? ['0px', '80px', '140px'] : offsets);
    await wrapper.get('#a-tab').trigger('drop', { dataTransfer: { getData: (format: string) => 'text/vnt-group' === format ? group : 'd' } });
    await nextTick();
    expectState(group, ['d', 'c', 'a'], 'a');
    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.attributes('id'))).toEqual(['d-tab', 'c-tab', 'a-tab']);
    expect(positions()).toEqual('left' === property ? ['0px', '90px', '150px'] : offsets);
  });
});

function statefulView(iframe = false) {
  const mounts: string[] = [];
  const unmounts: string[] = [];
  const View = defineComponent({
    props: { name: { required: true, type: String } },
    setup(props) {
      const count = ref(0);

      onMounted(() => mounts.push(props.name));
      onUnmounted(() => unmounts.push(props.name));

      return () => h('section', { 'data-view': props.name }, [
        h('button', { onClick: () => count.value++ }, `${props.name}:${count.value}`),
        ...(iframe ? [h('iframe', { src: 'about:blank', title: props.name })] : []),
      ]);
    },
  });

  return { mounts, unmounts, View };
}

describe('TabView lifecycle', () => {
  it('UI-05: preserves ordinary state on switching but resets on refresh and re-add', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const group = newGroup();
    const { mounts, unmounts, View } = statefulView();
    const a = makeTab('a', { active: true, closable: true, view: View, viewProps: { name: 'a' } });

    createTabs(group, [a, makeTab('b', { view: View, viewProps: { name: 'b' } })]);
    const wrapper = trackMounted(mount(TabView, { props: { group } }));

    expect(wrapper.attributes('role')).toBe('tabpanel');
    await wrapper.get('button').trigger('click');
    const original = wrapper.get('[data-view="a"]').element;

    await activate(group, 'b');
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['b:0']);
    await wrapper.get('button').trigger('click');
    await activate(group, 'a');
    expect(wrapper.get('button').text()).toBe('a:1');
    expect(wrapper.get('[data-view="a"]').element).toBe(original);
    expect(mounts).toEqual(['a', 'b']);
    expect(unmounts).toEqual([]);

    refreshTab(group, 'a');
    await nextTick();
    expect(useCurrentTab(group).value._key).toBe('a~1000');
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['a:0']);
    expect(wrapper.get('[data-view="a"]').element).not.toBe(original);
    expect(mounts).toEqual(['a', 'b', 'a']);
    await wrapper.get('button').trigger('click');
    removeTab(group, 'a');
    await nextTick();
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['b:1']);
    vi.setSystemTime(2000);
    addTab(group, a);
    await nextTick();
    expect(useTabs(group).map((tab) => tab.id)).toEqual(['b', 'a']);
    expect(useCurrentTab(group).value._key).toBe('a~2000');
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['a:0']);
    expect(mounts).toEqual(['a', 'b', 'a', 'a']);
  });

  it.each([false, true])('UI-05/06: reloading an inactive tab preserves selection and resets its view (hasIframe=%s)', async (hasIframe) => {
    vi.useFakeTimers();
    vi.setSystemTime(3000);
    const group = newGroup();
    const { mounts, View } = statefulView(hasIframe);

    const tabs = createTabs(group, ['a', 'b'].map((id) => makeTab(id, { hasIframe, view: View, viewProps: { name: id } })));
    const nav = trackMounted(mount(HTabs, { props: { group, tabs } }));
    const wrapper = trackMounted(mount(TabView, { props: { group } }));

    await wrapper.get('button').trigger('click');
    await nav.get('#b-tab').trigger('click');
    await nav.get('#a-tab').trigger('contextmenu', { clientX: 10, clientY: 10 });
    const reload = nav.findAll('[role="menuitem"]').find((item) => 'Reload' === item.text());

    expect(reload).toBeDefined();
    await reload!.trigger('click');
    expect(useCurrentTab(group).value.id).toBe('b');
    expect(nav.findAll('.vp-item-active').map((tab) => tab.attributes('id'))).toEqual(['b-tab']);
    expect(wrapper.get('[data-view="b"] button').text()).toBe('b:0');
    expect(mounts).toEqual(['a', 'b']);
    await nav.get('#a-tab').trigger('click');
    expect(wrapper.get('[data-view="a"] button').text()).toBe('a:0');
    expect(wrapper.findAll('[data-view="a"]')).toHaveLength(1);
    expect(mounts).toEqual(['a', 'b', 'a']);
  });

  it('UI-04/06: updates an open iframe view when the app replaces its props', async () => {
    const group = newGroup();
    const { mounts, View } = statefulView(true);
    const tabs = createTabs(group, [makeTab('a', { hasIframe: true, view: View, viewProps: { name: 'original' } })]);
    const wrapper = trackMounted(mount(TabView, { props: { group } }));
    const original = wrapper.get('iframe').element;

    await wrapper.get('button').trigger('click');
    addTab(group, { ...tabs[0], viewProps: { name: 'updated' } });
    await nextTick();
    expect(useCurrentTab(group).value.viewProps).toEqual({ name: 'updated' });
    expect(wrapper.get('button').text()).toBe('updated:1');
    expect(wrapper.get('iframe').attributes('title')).toBe('updated');
    expect(wrapper.get('iframe').element).toBe(original);
    expect(mounts).toEqual(['original']);
  });

  it('UI-06: retains visited iframe nodes, shows only the active view and replaces refreshed/re-added instances', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const group = newGroup();
    const { mounts, unmounts, View } = statefulView(true);
    const ordinary = statefulView();
    const frameA = makeTab('a', { active: true, closable: true, hasIframe: true, view: View, viewProps: { name: 'a' } });

    createTabs(group, [frameA, makeTab('b', { hasIframe: true, view: View, viewProps: { name: 'b' } }), makeTab('c', { view: ordinary.View, viewProps: { name: 'c' } })]);
    const host = document.createElement('div');

    document.body.appendChild(host);
    const wrapper = trackMounted(mount(TabView, { attachTo: host, props: { group } }));

    trackMounted({ unmount: () => host.remove() });
    const original = wrapper.get('iframe').element;

    expect(wrapper.findAll('iframe')).toHaveLength(1);
    await wrapper.get('button').trigger('click');
    await activate(group, 'b');
    const second = wrapper.get('[data-view="b"] iframe').element;

    expect(wrapper.get('[data-view="a"]').isVisible()).toBe(false);
    expect(wrapper.get('[data-view="b"]').isVisible()).toBe(true);
    await activate(group, 'c');
    expect(wrapper.get('[data-view="c"]').isVisible()).toBe(true);
    await wrapper.get('[data-view="c"] button').trigger('click');
    expect(wrapper.findAll('iframe').every((frame) => !frame.isVisible())).toBe(true);
    await activate(group, 'a');
    expect(wrapper.find('[data-view="c"]').exists()).toBe(false);
    expect(wrapper.get('[data-view="a"] button').text()).toBe('a:1');
    expect(wrapper.get('[data-view="a"] iframe').element).toBe(original);
    expect(wrapper.get('[data-view="b"] iframe').element).toBe(second);
    expect(mounts).toEqual(['a', 'b']);
    expect(unmounts).toEqual([]);
    refreshTab(group, 'a');
    await nextTick();
    expect(wrapper.findAll('[data-view="a"]')).toHaveLength(1);
    expect(wrapper.get('[data-view="a"] iframe').element).not.toBe(original);
    expect(wrapper.get('[data-view="a"] button').text()).toBe('a:0');
    expect(unmounts).toEqual(['a']);
    const refreshed = wrapper.get('[data-view="a"] iframe').element;

    removeTab(group, 'a');
    await nextTick();
    expect(wrapper.get('[data-view="b"]').isVisible()).toBe(true);
    expect(wrapper.findAll('[data-view="a"]').every((node) => !node.isVisible())).toBe(true);
    vi.setSystemTime(2000);
    addTab(group, frameA);
    await nextTick();
    expect(wrapper.findAll('[data-view="a"]')).toHaveLength(1);
    expect(wrapper.get('[data-view="a"] iframe').element).not.toBe(refreshed);
    expect(wrapper.get('[data-view="a"] button').text()).toBe('a:0');
    expect(wrapper.get('[data-view="b"]').isVisible()).toBe(false);
    expect(mounts).toEqual(['a', 'b', 'a', 'a']);
    expect(unmounts).toEqual(['a', 'a']);
    await activate(group, 'c');
    expect(wrapper.get('[data-view="c"] button').text()).toBe('c:1');
    expect(ordinary.mounts).toEqual(['c']);
    expect(wrapper.findAll('iframe').every((frame) => !frame.isVisible())).toBe(true);
  });

  it.each([{ Component: HTabs, name: 'HTabs' }, { Component: VTabs, name: 'VTabs' }])('UI-07: $name returns to blank after closing the last tab', async ({ Component }) => {
    const group = newGroup();
    const tabs = createTabs(group, []);
    const nav = trackMounted(mount(Component, { props: { group, tabs } }));
    const wrapper = trackMounted(mount(TabView, { props: { group } }));

    expect(wrapper.findComponent(BlankTabView).exists()).toBe(true);
    expect(nav.findAll('[role="tab"]').map((tab) => tab.attributes('id'))).toEqual(['_-tab']);
    expect(nav.find('#_-tab .vp-icon-x').exists()).toBe(false);
    addTab(group, makeTab('only', { closable: true, view: MsgView, viewProps: { msg: 'real view' } }));
    await nextTick();
    expect(useTabs(group).map((tab) => tab.id)).toEqual(['only']);
    expect(useCurrentTab(group).value.id).toBe('only');
    expect(wrapper.findComponent(BlankTabView).exists()).toBe(false);
    expect(wrapper.get('.msg-view').text()).toBe('real view');
    await nav.get('#only-tab .vp-icon-x').trigger('click');
    expect(useTabs(group).map((tab) => tab.id)).toEqual(['_']);
    expect(useCurrentTab(group).value.id).toBe('_');
    expect(nav.findAll('[role="tab"]').map((tab) => tab.attributes('id'))).toEqual(['_-tab']);
    expect(nav.find('#_-tab .vp-icon-x').exists()).toBe(false);
    expect(wrapper.findComponent(BlankTabView).exists()).toBe(true);
    expect(wrapper.find('.msg-view').exists()).toBe(false);
  });

  it('notifies the consumer once when leaving the tab area', async () => {
    const group = newGroup();

    seedTabs(group);
    const deactivated: string[] = [];
    const Consumer = defineComponent({
      setup() {
        onTabDeactivated(group, (tab) => deactivated.push(tab.id));

        return () => h(TabView, { group });
      },
    });
    const Root = defineComponent({ render: () => h(KeepAlive, null, { default: () => h(Consumer) }) });

    trackMounted(mount(Root));
    await nextTick();
    expect(deactivated).toEqual([]);
    unmountAll();
    expect(deactivated).toEqual(['a']);
  });
});
