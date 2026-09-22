import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';

import VueNavTabError, { MISSING_REQUIRED_PROPS } from '../lib/utils/error';
import {
  addTab,
  createTabs,
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

function seedStandard(group: string) {
  return createTabs(group, [
    makeTab('a', { active: true }),
    makeTab('b', { closable: true }),
    makeTab('c', { closable: true }),
  ]);
}

describe('createTabs', () => {

  it('cooks tabs with generated keys and normalized flags', () => {
    const tabs = seedStandard('op-create');

    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toMatchObject({ _key: 'a~', active: true, closable: false, hasIframe: false });
    expect(tabs[1]).toMatchObject({ _key: 'b~', active: false, closable: true });
    expect(useCurrentTab('op-create').value.id).toBe('a');
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

  it('rejects tabs missing required props', () => {
    expect(() => createTabs('op-no-view', [{ id: 'x', title: 'X' } as unknown as Tab])).toThrowError(MISSING_REQUIRED_PROPS);
    expect(() => createTabs('op-no-id', [{ title: 'X', view: stubView } as unknown as Tab])).toThrowError(MISSING_REQUIRED_PROPS);
  });

  it('falls back to a blank tab for an empty array', () => {
    const tabs = createTabs('op-empty', []);

    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toMatchObject({ active: true, id: '_' });
  });
});

describe('useTabs and useCurrentTab', () => {

  it('throws for an unknown group', () => {
    expect(() => useTabs('op-unknown')).toThrowError('Group \'op-unknown\' is undefined');
  });

  it('tracks the active tab through activation changes', () => {
    seedStandard('op-track');
    addTab('op-track', makeTab('d', { active: true, closable: true }));

    expect(useCurrentTab('op-track').value.id).toBe('d');
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
});

describe('removeTab', () => {

  it('ignores unknown ids and non-closable tabs', () => {
    seedStandard('op-remove-noop');
    removeTab('op-remove-noop', 'zzz');
    removeTab('op-remove-noop', 'a');

    expect(ids('op-remove-noop')).toEqual(['a', 'b', 'c']);
  });

  it('removes an inactive tab without touching activation', () => {
    seedStandard('op-remove-idle');
    removeTab('op-remove-idle', 'c');

    expect(ids('op-remove-idle')).toEqual(['a', 'b']);
    expect(useCurrentTab('op-remove-idle').value.id).toBe('a');
  });

  it('activates the previous tab when the active one is removed', () => {
    seedStandard('op-remove-active');
    addTab('op-remove-active', makeTab('b', { active: true, closable: true }));
    removeTab('op-remove-active', 'b');

    expect(ids('op-remove-active')).toEqual(['a', 'c']);
    expect(useCurrentTab('op-remove-active').value.id).toBe('a');
  });

  it('activates the next tab when the first active tab is removed', () => {
    createTabs('op-remove-first', [
      makeTab('a', { active: true, closable: true }),
      makeTab('b', { closable: true }),
    ]);
    removeTab('op-remove-first', 'a');

    expect(ids('op-remove-first')).toEqual(['b']);
    expect(useCurrentTab('op-remove-first').value.id).toBe('b');
  });

  it('falls back to a blank tab when the last tab is removed', () => {
    createTabs('op-remove-last', [makeTab('solo', { active: true, closable: true })]);
    removeTab('op-remove-last', 'solo');
    const tabs = useTabs('op-remove-last');

    expect(tabs).toHaveLength(1);
    expect(tabs[0].id).toBe('_');
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
  });

  it('prunes nested groups of the refreshed group', () => {
    seedStandard('op-prune');
    createTabs('op-prune.child', [makeTab('x', { active: true })]);
    refreshTab('op-prune', 'a');

    expect(() => useTabs('op-prune.child')).toThrowError('Group \'op-prune.child\' is undefined');
  });
});

describe('removeAll', () => {

  it('removes only closable tabs and keeps the pinned active one', () => {
    seedStandard('op-all');
    removeAll('op-all');

    expect(ids('op-all')).toEqual(['a']);
    expect(useCurrentTab('op-all').value.id).toBe('a');
  });

  it('falls back to a blank tab when every tab is closable', () => {
    createTabs('op-all-blank', [
      makeTab('x', { active: true, closable: true }),
      makeTab('y', { closable: true }),
    ]);
    removeAll('op-all-blank');

    expect(ids('op-all-blank')).toEqual(['_']);
  });

  it('activates the first survivor when the active tab is removed', () => {
    createTabs('op-all-survivor', [
      makeTab('x', { active: true, closable: true }),
      makeTab('y'),
      makeTab('z', { closable: true }),
    ]);
    removeAll('op-all-survivor');

    expect(ids('op-all-survivor')).toEqual(['y']);
    expect(useCurrentTab('op-all-survivor').value.id).toBe('y');
  });
});

describe('removeLeft and removeRight', () => {

  it('ignores unknown ids', () => {
    seedStandard('op-side-noop');
    removeLeft('op-side-noop', 'zzz');
    removeRight('op-side-noop', 'zzz');

    expect(ids('op-side-noop')).toEqual(['a', 'b', 'c']);
  });

  it('removes only closable tabs left of the anchor', () => {
    seedStandard('op-left');
    removeLeft('op-left', 'c');

    expect(ids('op-left')).toEqual(['a', 'c']);
  });

  it('activates the anchor when the active tab is removed from the left', () => {
    createTabs('op-left-active', [
      makeTab('x', { active: true, closable: true }),
      makeTab('y', { closable: true }),
      makeTab('c', { closable: true }),
    ]);
    removeLeft('op-left-active', 'c');

    expect(ids('op-left-active')).toEqual(['c']);
    expect(useCurrentTab('op-left-active').value.id).toBe('c');
  });

  it('removes only closable tabs right of the anchor', () => {
    seedStandard('op-right');
    removeRight('op-right', 'a');

    expect(ids('op-right')).toEqual(['a']);
  });

  it('activates the anchor when the active tab is removed from the right', () => {
    createTabs('op-right-active', [
      makeTab('a', { closable: true }),
      makeTab('x', { active: true, closable: true }),
      makeTab('c', { closable: true }),
    ]);
    removeRight('op-right-active', 'a');

    expect(ids('op-right-active')).toEqual(['a']);
    expect(useCurrentTab('op-right-active').value.id).toBe('a');
  });

  it('removes both sides with removeOthers', () => {
    seedStandard('op-others');
    removeOthers('op-others', 'b');

    expect(ids('op-others')).toEqual(['a', 'b']);
  });

  it('aliases above to left and below to right', () => {
    seedStandard('op-above');
    removeAbove('op-above', 'c');

    expect(ids('op-above')).toEqual(['a', 'c']);

    seedStandard('op-below');
    removeBelow('op-below', 'a');

    expect(ids('op-below')).toEqual(['a']);
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
