import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, watch } from 'vue';
import { describe, expect, it } from 'vitest';

import TabView from '../lib/components/TabView.vue';
import VueNavTabError, { MISSING_REQUIRED_PROPS } from '../lib/utils/error';
import {
  addTab,
  createTabs,
  onTabActivated,
  onTabDeactivated,
  refreshTab,
  removeAbove,
  removeAll,
  removeBelow,
  removeLeft,
  removeOthers,
  removeRight,
  removeTab,
  Tab,
  useCurrentTab,
  useTabs,
} from '../lib/hooks/use-operations';

const stubView = defineComponent({ name: 'StubView', render: () => h('p', 'stub') });

function makeTab(id: string, overrides: Partial<Tab> = {}): Tab {
  return { id, title: `Title ${id}`, view: stubView, ...overrides };
}

function ids(group: string) {
  return useTabs(group).map((tab: Tab) => tab.id);
}

function expectActive(group: string, id: string) {
  expect(useTabs(group).filter((tab: Tab) => tab.active).map((tab: Tab) => tab.id)).toEqual([id]);
  expect(useCurrentTab(group).value.id).toBe(id);
}

function seedStandard(group: string) {
  return createTabs(group, [
    makeTab('a', { active: true }),
    makeTab('b', { closable: true }),
    makeTab('c', { closable: true }),
  ]);
}

function seedRemoval(group: string, active = 'a') {
  return createTabs(group, [
    makeTab('a', { active: 'a' === active }),
    makeTab('b', { active: 'b' === active, closable: true }),
    makeTab('c', { active: 'c' === active, closable: true }),
    makeTab('d', { active: 'd' === active }),
    makeTab('e', { active: 'e' === active, closable: true }),
    makeTab('f', { active: 'f' === active, closable: true }),
    makeTab('g', { active: 'g' === active }),
  ]);
}

describe('createTabs', () => {

  it('cooks tabs with generated keys and normalized flags', () => {
    const source = [
      makeTab('a', { active: true }),
      makeTab('b', { closable: true }),
      makeTab('c', { closable: true }),
    ];
    const tabs = createTabs('op-create', source);

    expect(tabs).toHaveLength(3);
    expect(useTabs('op-create')).toBe(tabs);
    expect(tabs[0]).toMatchObject({ _key: 'a~', active: true, closable: false, hasIframe: false });
    expect(tabs[1]).toMatchObject({ _key: 'b~', active: false, closable: true });
    expectActive('op-create', 'a');
    expect(source[0].active).toBe(true);
    expect(source[1].active).toBeUndefined();
    expect(source[1]._key).toBeUndefined();
  });

  it('rejects a non-array payload', () => {
    expect(() => createTabs('op-bad', undefined as unknown as Tab[])).toThrowError('\'tabs\' must be an array');
  });

  it('rejects recreating an existing group', () => {
    seedStandard('op-dup');

    expect(() => seedStandard('op-dup')).toThrowError('\'op-dup\' group was created');
  });

  it('rejects a nested group whose parent is missing', () => {
    expect(() => createTabs('op-missing.child', [makeTab('a')])).toThrowError('\'op-missing\' group is missing');
  });

  it('accepts a nested group once the parent exists', () => {
    seedStandard('op-parent');
    const tabs = createTabs('op-parent.child', [makeTab('x', { active: true })]);

    expect(tabs).toHaveLength(1);
    expect(useCurrentTab('op-parent.child').value.id).toBe('x');
  });

  it('accepts a grandchild after each full parent path exists', () => {
    createTabs('op-grandparent', [makeTab('a', { active: true })]);
    createTabs('op-grandparent.child', [makeTab('b', { active: true })]);
    createTabs('op-grandparent.child.leaf', [makeTab('c', { active: true })]);

    expect(ids('op-grandparent.child.leaf')).toEqual(['c']);
    expectActive('op-grandparent.child.leaf', 'c');
  });

  it('rejects a grandchild when its immediate parent is missing', () => {
    createTabs('op-orphan-parent', [makeTab('a', { active: true })]);

    expect(() => createTabs('op-orphan-parent.child.leaf', [makeTab('c', { active: true })])).toThrowError(VueNavTabError);
    expect(ids('op-orphan-parent')).toEqual(['a']);
    expect(() => useTabs('op-orphan-parent.child.leaf')).toThrowError(VueNavTabError);
  });

  it('rejects tabs missing required props', () => {
    expect(() => createTabs('op-no-view', [{ id: 'x', title: 'X' } as unknown as Tab])).toThrowError(MISSING_REQUIRED_PROPS);
    expect(() => createTabs('op-no-id', [{ title: 'X', view: stubView } as unknown as Tab])).toThrowError(MISSING_REQUIRED_PROPS);
  });

  it.each([
    ['null entry', [null]],
    ['null title', [makeTab('x', { title: null as unknown as string })]],
    ['undefined title', [makeTab('x', { title: undefined as unknown as string })]],
    ['null view', [makeTab('x', { view: null as unknown as Tab['view'] })]],
    ['empty id', [makeTab('')]],
    ['non-string id', [makeTab(42 as unknown as string)]],
  ])('rejects %s without creating a group', (name, value) => {
    const group = `op-invalid-${name}`;

    expect(() => createTabs(group, value as Tab[])).toThrowError(VueNavTabError);
    expect(() => useTabs(group)).toThrowError(VueNavTabError);
  });

  it('replaces duplicate ids with the later tab while preserving tab order', () => {
    const tabs = createTabs('op-duplicate-ids', [
      makeTab('x', { closable: true, title: 'Original', viewProps: { old: true } }),
      makeTab('y'),
      makeTab('x', { active: true, title: 'Replacement', viewProps: { updated: true } }),
    ]);

    expect(ids('op-duplicate-ids')).toEqual(['x', 'y']);
    expect(tabs[0]).toMatchObject({ _key: 'x~', active: true, closable: false, title: 'Replacement', viewProps: { updated: true } });
    expect(tabs[0].viewProps).toEqual({ updated: true });
    expectActive('op-duplicate-ids', 'x');
  });

  it('activates the first tab when no initial tab is marked active', () => {
    createTabs('op-no-active', [makeTab('a'), makeTab('b')]);

    expectActive('op-no-active', 'a');
  });

  it('keeps only the last initially active tab active', () => {
    createTabs('op-multi-active', [
      makeTab('a', { active: true }),
      makeTab('b', { active: true }),
      makeTab('c', { active: true }),
    ]);

    expectActive('op-multi-active', 'c');
  });

  it('falls back to a blank tab for an empty array', () => {
    const tabs = createTabs('op-empty', []);

    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toMatchObject({ active: true, id: '_' });
  });
});

describe('useTabs and useCurrentTab', () => {

  it('throws for an unknown group through useTabs', () => {
    expect(() => useTabs('op-unknown')).toThrowError('Group \'op-unknown\' is undefined');
  });

  it('throws for an unknown group through useCurrentTab', () => {
    expect(() => useCurrentTab('op-current-unknown')).toThrowError(VueNavTabError);
  });

  it('returns the created tab list through useTabs', () => {
    const created = seedStandard('op-use-tabs');

    expect(useTabs('op-use-tabs')).toBe(created);
    expect(ids('op-use-tabs')).toEqual(['a', 'b', 'c']);
  });

  it('tracks the active tab through activation changes', () => {
    seedStandard('op-track');
    addTab('op-track', makeTab('d', { active: true, closable: true }));

    expect(useCurrentTab('op-track').value.id).toBe('d');
  });

  it('reacts to adding and removing an active tab', async () => {
    seedStandard('op-observe');
    const seen: string[] = [];
    const stop = watch(useCurrentTab('op-observe'), (tab) => seen.push(tab.id));

    try {
      addTab('op-observe', makeTab('d', { active: true, closable: true }));
      await nextTick();
      removeTab('op-observe', 'd');
      await nextTick();

      expect(seen).toEqual(['d', 'c']);
      expectActive('op-observe', 'c');
    }
    finally {
      stop();
    }
  });
});

describe('addTab', () => {

  it('appends an inactive tab and keeps the current one', () => {
    seedStandard('op-add');
    addTab('op-add', makeTab('d', { closable: true }));

    expect(ids('op-add')).toEqual(['a', 'b', 'c', 'd']);
    expect(useCurrentTab('op-add').value.id).toBe('a');
  });

  it('deactivates the current tab when the newcomer is active', () => {
    seedStandard('op-add-active');
    addTab('op-add-active', makeTab('d', { active: true, closable: true }));

    expect(useCurrentTab('op-add-active').value.id).toBe('d');
    expect(useTabs('op-add-active').find((tab: Tab) => 'a' === tab.id)?.active).toBe(false);
  });

  it('replaces an existing tab while preserving its key', () => {
    seedStandard('op-replace');
    addTab('op-replace', makeTab('b', { closable: true, title: 'B2' }));
    const tabs = useTabs('op-replace');

    expect(ids('op-replace')).toEqual(['a', 'b', 'c']);
    expect(tabs.find((tab: Tab) => 'b' === tab.id)?.title).toBe('B2');
    expect(tabs.find((tab: Tab) => 'b' === tab.id)?._key).toBe('b~');
  });

  it('replaces the current tab without deactivating it or changing its key', () => {
    seedStandard('op-replace-current');
    addTab('op-replace-current', makeTab('a', { title: 'Updated A', viewProps: { message: 'new' } }));

    expect(ids('op-replace-current')).toEqual(['a', 'b', 'c']);
    expectActive('op-replace-current', 'a');
    expect(useTabs('op-replace-current')[0]).toMatchObject({ _key: 'a~', title: 'Updated A', viewProps: { message: 'new' } });
  });

  it('activates an existing tab when it is replaced with active state', () => {
    seedStandard('op-replace-active');
    addTab('op-replace-active', makeTab('b', { active: true, closable: true, title: 'Updated B' }));

    expect(ids('op-replace-active')).toEqual(['a', 'b', 'c']);
    expectActive('op-replace-active', 'b');
    expect(useTabs('op-replace-active')[1]).toMatchObject({ _key: 'b~', title: 'Updated B' });
  });

  it('gives a re-added removed tab a fresh key at the end', () => {
    seedStandard('op-readd');
    removeTab('op-readd', 'b');
    addTab('op-readd', makeTab('b', { closable: true }));
    const tab = useTabs('op-readd').find((entry: Tab) => 'b' === entry.id);

    expect(ids('op-readd')).toEqual(['a', 'c', 'b']);
    expect(tab?._key).not.toBe('b~');
  });

  it('replaces the lone blank tab', () => {
    createTabs('op-blank-add', []);
    addTab('op-blank-add', makeTab('x'));

    expect(ids('op-blank-add')).toEqual(['x']);
    expect(useCurrentTab('op-blank-add').value.id).toBe('x');
  });

  it('rejects invalid tabs and unknown groups', () => {
    seedStandard('op-add-invalid');

    expect(() => addTab('op-add-invalid', { id: 'x' } as unknown as Tab)).toThrowError(MISSING_REQUIRED_PROPS);
    expect(() => addTab('op-unknown', makeTab('x'))).toThrowError('Group \'op-unknown\' is undefined');
  });

  it.each([
    ['null tab', null],
    ['null title', makeTab('x', { title: null as unknown as string })],
    ['undefined title', makeTab('x', { title: undefined as unknown as string })],
    ['null view', makeTab('x', { view: null as unknown as Tab['view'] })],
    ['empty id', makeTab('')],
    ['non-string id', makeTab(42 as unknown as string)],
  ])('rejects %s without changing existing tabs', (name, value) => {
    const group = `op-add-invalid-${name}`;

    seedStandard(group);
    expect(() => addTab(group, value as Tab)).toThrowError(VueNavTabError);
    expect(ids(group)).toEqual(['a', 'b', 'c']);
    expectActive(group, 'a');
  });

  it('keeps unrelated groups unchanged when a tab is added and removed', () => {
    seedStandard('op-isolation-left');
    seedStandard('op-isolation-right');

    addTab('op-isolation-left', makeTab('d', { active: true, closable: true }));
    removeTab('op-isolation-left', 'b');

    expect(ids('op-isolation-left')).toEqual(['a', 'c', 'd']);
    expectActive('op-isolation-left', 'd');
    expect(ids('op-isolation-right')).toEqual(['a', 'b', 'c']);
    expectActive('op-isolation-right', 'a');
  });
});

describe('removeTab', () => {

  it('rejects unknown ids and preserves non-closable tabs without changing state', () => {
    seedRemoval('op-remove-noop');

    expect(() => removeTab('op-remove-noop', 'zzz')).toThrowError(new VueNavTabError("'zzz' doesn't exist in group 'op-remove-noop'"));
    expect(ids('op-remove-noop')).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expectActive('op-remove-noop', 'a');

    removeTab('op-remove-noop', 'a');

    expect(ids('op-remove-noop')).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expectActive('op-remove-noop', 'a');
  });

  it('removes an inactive tab without touching activation', () => {
    seedRemoval('op-remove-idle');
    removeTab('op-remove-idle', 'c');

    expect(ids('op-remove-idle')).toEqual(['a', 'b', 'd', 'e', 'f', 'g']);
    expect(useCurrentTab('op-remove-idle').value.id).toBe('a');
  });

  it('activates the previous tab when the active one is removed', () => {
    seedRemoval('op-remove-active');
    addTab('op-remove-active', makeTab('b', { active: true, closable: true }));
    removeTab('op-remove-active', 'b');

    expect(ids('op-remove-active')).toEqual(['a', 'c', 'd', 'e', 'f', 'g']);
    expect(useCurrentTab('op-remove-active').value.id).toBe('a');
  });

  it('activates the next tab when the first active tab is removed', () => {
    createTabs('op-remove-first', [
      makeTab('a', { active: true, closable: true }),
      makeTab('b'),
      makeTab('c', { closable: true }),
      makeTab('d'),
      makeTab('e', { closable: true }),
    ]);
    removeTab('op-remove-first', 'a');

    expect(ids('op-remove-first')).toEqual(['b', 'c', 'd', 'e']);
    expect(useCurrentTab('op-remove-first').value.id).toBe('b');
  });

  it('falls back to a blank tab when the last tab is removed', () => {
    createTabs('op-remove-last', [makeTab('solo', { active: true, closable: true })]);
    removeTab('op-remove-last', 'solo');
    const tabs = useTabs('op-remove-last');

    expect(tabs).toHaveLength(1);
    expect(tabs[0].id).toBe('_');
    expectActive('op-remove-last', '_');
    removeTab('op-remove-last', '_');
    expect(ids('op-remove-last')).toEqual(['_']);
  });
});

describe('refreshTab', () => {

  it('regenerates the tab key', () => {
    seedStandard('op-refresh');
    const before = useTabs('op-refresh').find((tab: Tab) => 'b' === tab.id)?._key;

    refreshTab('op-refresh', 'b');
    const after = useTabs('op-refresh').find((tab: Tab) => 'b' === tab.id)?._key;

    expect(after).not.toBe(before);
    expect(after?.startsWith('b~')).toBe(true);
  });

  it('throws for an unknown tab', () => {
    seedStandard('op-refresh-unknown');

    expect(() => refreshTab('op-refresh-unknown', 'zzz')).toThrowError('\'zzz\' doesn\'t exist');
    expect(ids('op-refresh-unknown')).toEqual(['a', 'b', 'c']);
    expectActive('op-refresh-unknown', 'a');
  });

  it('throws for an undefined group', () => {
    expect(() => refreshTab('op-refresh-missing-group', 'a')).toThrowError(VueNavTabError);
  });

  it('remounts the active view with fresh local state', async () => {
    const StatefulView = defineComponent({
      setup() {
        const count = ref(0);

        return () => h('button', { onClick: () => count.value++ }, String(count.value));
      },
    });

    createTabs('op-refresh-view', [{ ...makeTab('a', { active: true }), view: StatefulView }]);
    const wrapper = mount(TabView, { props: { group: 'op-refresh-view' } });

    try {
      await wrapper.find('button').trigger('click');
      expect(wrapper.find('button').text()).toBe('1');

      refreshTab('op-refresh-view', 'a');
      await nextTick();

      expect(wrapper.find('button').text()).toBe('0');
      expectActive('op-refresh-view', 'a');
    }
    finally {
      wrapper.unmount();
    }
  });

  it('recreates nested groups with fresh child state when the parent tab is refreshed', async () => {
    const group = 'op-refresh-parent';
    const childGroup = `${group}.child`;
    const ChildView = defineComponent({
      setup() {
        const count = ref(0);

        return () => h('button', { onClick: () => count.value++ }, String(count.value));
      },
    });
    const ParentView = defineComponent({
      setup() {
        createTabs(childGroup, [makeTab('x', { active: true, view: ChildView })]);

        return () => h(TabView, { group: childGroup });
      },
    });

    createTabs(group, [makeTab('parent', { active: true, view: ParentView })]);
    const wrapper = mount(TabView, { props: { group } });

    try {
      const originalChildren = useTabs(childGroup);

      addTab(childGroup, makeTab('extra'));
      await wrapper.find('button').trigger('click');
      expect(ids(childGroup)).toEqual(['x', 'extra']);
      expect(wrapper.find('button').text()).toBe('1');

      refreshTab(group, 'parent');
      await nextTick();

      expect(useTabs(childGroup)).not.toBe(originalChildren);
      expect(ids(childGroup)).toEqual(['x']);
      expectActive(childGroup, 'x');
      expect(wrapper.find('button').text()).toBe('0');
    }
    finally {
      wrapper.unmount();
    }
  });

  it('keeps similarly prefixed sibling groups when a parent is refreshed', () => {
    createTabs('op-prefix', [makeTab('root', { active: true })]);
    createTabs('op-prefix.b', [makeTab('b', { active: true })]);
    createTabs('op-prefix.bc', [makeTab('bc', { active: true })]);

    refreshTab('op-prefix.b', 'b');

    expect(ids('op-prefix.bc')).toEqual(['bc']);
    expectActive('op-prefix.bc', 'bc');
  });
});

describe('removeAll', () => {

  it('removes only closable tabs and keeps the pinned active one', () => {
    seedRemoval('op-all');
    removeAll('op-all');

    expect(ids('op-all')).toEqual(['a', 'd', 'g']);
    expect(useCurrentTab('op-all').value.id).toBe('a');
  });

  it('falls back to a blank tab when every tab is closable', () => {
    createTabs('op-all-blank', [
      makeTab('x', { active: true, closable: true }),
      makeTab('y', { closable: true }),
      makeTab('z', { closable: true }),
      makeTab('u', { closable: true }),
      makeTab('v', { closable: true }),
    ]);
    removeAll('op-all-blank');

    expect(ids('op-all-blank')).toEqual(['_']);
  });

  it('activates the first survivor when the active tab is removed', () => {
    seedRemoval('op-all-survivor', 'b');
    removeAll('op-all-survivor');

    expect(ids('op-all-survivor')).toEqual(['a', 'd', 'g']);
    expectActive('op-all-survivor', 'a');
  });

  it('keeps a pinned-only group unchanged', () => {
    createTabs('op-all-pinned', [makeTab('a', { active: true }), makeTab('b'), makeTab('c'), makeTab('d'), makeTab('e')]);

    removeAll('op-all-pinned');

    expect(ids('op-all-pinned')).toEqual(['a', 'b', 'c', 'd', 'e']);
    expectActive('op-all-pinned', 'a');
  });
});

describe('removeLeft and removeRight', () => {

  it('removes only closable tabs left of the anchor', () => {
    seedRemoval('op-left');
    removeLeft('op-left', 'd');

    expect(ids('op-left')).toEqual(['a', 'd', 'e', 'f', 'g']);
    expectActive('op-left', 'a');
  });

  it('activates the anchor when the active tab is removed from the left', () => {
    seedRemoval('op-left-active', 'c');
    removeLeft('op-left-active', 'd');

    expect(ids('op-left-active')).toEqual(['a', 'd', 'e', 'f', 'g']);
    expectActive('op-left-active', 'd');
  });

  it('removes only closable tabs right of the anchor', () => {
    seedRemoval('op-right');
    removeRight('op-right', 'd');

    expect(ids('op-right')).toEqual(['a', 'b', 'c', 'd', 'g']);
    expectActive('op-right', 'a');
  });

  it('activates the anchor when the active tab is removed from the right', () => {
    seedRemoval('op-right-active', 'f');
    removeRight('op-right-active', 'd');

    expect(ids('op-right-active')).toEqual(['a', 'b', 'c', 'd', 'g']);
    expectActive('op-right-active', 'd');
  });

  it('removes both sides with removeOthers', () => {
    seedRemoval('op-others');
    removeOthers('op-others', 'e');

    expect(ids('op-others')).toEqual(['a', 'd', 'e', 'g']);
    expectActive('op-others', 'a');
  });

  it('aliases above to left and below to right', () => {
    seedRemoval('op-above');
    removeAbove('op-above', 'd');

    expect(ids('op-above')).toEqual(['a', 'd', 'e', 'f', 'g']);
    expectActive('op-above', 'a');

    seedRemoval('op-below');
    removeBelow('op-below', 'd');

    expect(ids('op-below')).toEqual(['a', 'b', 'c', 'd', 'g']);
    expectActive('op-below', 'a');
  });

  it.each([
    ['removeLeft', removeLeft, 'a'],
    ['removeAbove', removeAbove, 'a'],
    ['removeRight', removeRight, 'g'],
    ['removeBelow', removeBelow, 'g'],
  ])('%s leaves the group unchanged at the boundary', (name, remove, anchor) => {
    const group = `op-boundary-${name}`;

    seedRemoval(group);
    remove(group, anchor);

    expect(ids(group)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expectActive(group, 'a');
  });
});

describe('remove operation invariants', () => {

  it.each([
    { name: 'removeTab', remove: (group: string) => removeTab(group, 'b'), remaining: ['a', 'c', 'd', 'e', 'f', 'g'] },
    { name: 'removeAll', remove: removeAll, remaining: ['a', 'd', 'g'] },
    { name: 'removeLeft', remove: (group: string) => removeLeft(group, 'd'), remaining: ['a', 'd', 'e', 'f', 'g'] },
    { name: 'removeAbove', remove: (group: string) => removeAbove(group, 'd'), remaining: ['a', 'd', 'e', 'f', 'g'] },
    { name: 'removeRight', remove: (group: string) => removeRight(group, 'd'), remaining: ['a', 'b', 'c', 'd', 'g'] },
    { name: 'removeBelow', remove: (group: string) => removeBelow(group, 'd'), remaining: ['a', 'b', 'c', 'd', 'g'] },
    { name: 'removeOthers', remove: (group: string) => removeOthers(group, 'b'), remaining: ['a', 'b', 'd', 'g'] },
  ])('$name preserves a surviving pinned active tab', ({ name, remove, remaining }) => {
    const group = `op-pinned-active-${name}`;

    seedRemoval(group);
    remove(group);

    expect(ids(group)).toEqual(remaining);
    expectActive(group, 'a');
  });

  it.each([
    { active: 'a', initial: 'b', name: 'removeTab', remove: (group: string) => removeTab(group, 'b'), remaining: ['a', 'c', 'd', 'e', 'f', 'g'] },
    { active: 'a', initial: 'b', name: 'removeAll', remove: removeAll, remaining: ['a', 'd', 'g'] },
    { active: 'd', initial: 'c', name: 'removeLeft', remove: (group: string) => removeLeft(group, 'd'), remaining: ['a', 'd', 'e', 'f', 'g'] },
    { active: 'd', initial: 'c', name: 'removeAbove', remove: (group: string) => removeAbove(group, 'd'), remaining: ['a', 'd', 'e', 'f', 'g'] },
    { active: 'd', initial: 'f', name: 'removeRight', remove: (group: string) => removeRight(group, 'd'), remaining: ['a', 'b', 'c', 'd', 'g'] },
    { active: 'd', initial: 'f', name: 'removeBelow', remove: (group: string) => removeBelow(group, 'd'), remaining: ['a', 'b', 'c', 'd', 'g'] },
    { active: 'c', initial: 'b', name: 'removeOthers', remove: (group: string) => removeOthers(group, 'c'), remaining: ['a', 'c', 'd', 'g'] },
  ])('$name activates the documented fallback when the active tab is removed', ({ active, initial, name, remove, remaining }) => {
    const group = `op-removed-active-${name}`;

    seedRemoval(group, initial);
    remove(group);

    expect(ids(group)).toEqual(remaining);
    expectActive(group, active);
  });

  it.each([
    ['removeTab', (group: string) => removeTab(group, 'a')],
    ['removeAll', removeAll],
    ['removeLeft', (group: string) => removeLeft(group, 'a')],
    ['removeAbove', (group: string) => removeAbove(group, 'a')],
    ['removeRight', (group: string) => removeRight(group, 'a')],
    ['removeBelow', (group: string) => removeBelow(group, 'a')],
    ['removeOthers', (group: string) => removeOthers(group, 'a')],
  ])('%s throws for an undefined group', (name, remove) => {
    expect(() => remove(`op-undefined-${name}`)).toThrowError(VueNavTabError);
  });

  it.each([
    ['removeLeft', removeLeft],
    ['removeAbove', removeAbove],
    ['removeRight', removeRight],
    ['removeBelow', removeBelow],
    ['removeOthers', removeOthers],
  ])('%s rejects an unknown selected tab without changing state', (name, remove) => {
    const group = `op-unknown-anchor-${name}`;

    seedRemoval(group);

    expect(() => remove(group, 'missing')).toThrowError(VueNavTabError);
    expect(ids(group)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    expectActive(group, 'a');
  });
});

describe('tab visibility hooks', () => {

  it('calls activation and deactivation callbacks as views become visible and hidden', async () => {
    const group = 'op-visibility-hooks';
    const events: string[] = [];

    function trackedView(id: string) {
      return defineComponent({
        setup() {
          onTabActivated(group, (tab) => events.push(`activated:${id}:${tab.id}`));
          onTabDeactivated(group, (tab) => events.push(`deactivated:${id}:${tab.id}`));

          return () => h('p', id);
        },
      });
    }

    createTabs(group, [
      { ...makeTab('a', { active: true }), view: trackedView('a') },
      { ...makeTab('b', { closable: true }), view: trackedView('b') },
    ]);
    const wrapper = mount(TabView, { props: { group } });

    try {
      await nextTick();
      expect(events).toEqual(['activated:a:a']);

      addTab(group, { ...useTabs(group)[1], active: true });
      await nextTick();
      expect(events).toEqual(['activated:a:a', 'deactivated:a:a', 'activated:b:b']);

      addTab(group, { ...useTabs(group)[0], active: true });
      await nextTick();
      expect(events).toEqual(['activated:a:a', 'deactivated:a:a', 'activated:b:b', 'deactivated:b:b', 'activated:a:a']);
    }
    finally {
      wrapper.unmount();
    }
  });
});

describe('error surface', () => {

  it('throws library errors for invalid operations', () => {
    try {
      useTabs('op-never-created');
      expect.unreachable();
    }
    catch (error) {
      expect(error).toBeInstanceOf(VueNavTabError);
    }
  });
});
