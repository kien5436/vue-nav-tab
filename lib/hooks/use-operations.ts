import { Component, computed, ComputedRef, markRaw, onActivated, onDeactivated, reactive, ref, Ref, toRaw, VNode } from 'vue';

import VueNavTabError, { MISSING_REQUIRED_PROPS } from '../utils/error';
import BlankTabView from '../components/BlankTabView.vue';

export interface Tab {
  _key?: string;
  active?: boolean;
  closable?: boolean;
  id: string;
  title: string | Component | VNode;
  hoverTitle?: string;
  titleProps?: Record<string, unknown>;
  hasIframe?: boolean;
  view: Component | VNode;
  viewProps?: Record<string, unknown>;
}

const tabGroups: { [key: string]: Ref<Tab[]> } = reactive({});
const removedTabGroups: { [key: string]: string[] } = {};
const BlankTab: Tab = {
  active: true,
  id: '_',
  title: 'Blank',
  view: markRaw(BlankTabView),
};

export function createTabs(group: string, tabs: Tab[]) {

  const normalizedGroup = group.trim();

  if (normalizedGroup.startsWith('.') || normalizedGroup.endsWith('.') || '' === normalizedGroup)
    throw new VueNavTabError('Invalid group name');

  if (Object.hasOwn(tabGroups, normalizedGroup))
    throw new VueNavTabError(`'${group}' group was created. If you want to add more tabs into it, use 'addTab' instead`);

  if (!Array.isArray(tabs))
    throw new VueNavTabError("'tabs' must be an array");

  if (normalizedGroup.includes('.')) {

    let subGroup = '';

    for (let i = 0; i < normalizedGroup.length; ++i) {

      subGroup += normalizedGroup[i];

      if (i + 1 < normalizedGroup.length && '.' === normalizedGroup[i + 1] && !Object.hasOwn(tabGroups, subGroup))
        throw new VueNavTabError(`'${subGroup}' group is missing while creating nested tabs. Do you forget to create it?`);
    }
  }

  if (tabs.some((_tab) => !isValidTab(_tab)))
    throw new VueNavTabError(MISSING_REQUIRED_PROPS);

  const cookedTabs: Tab[] = [...new Map(tabs.map((tab) => [tab.id, tab])).values()].map((tab) => ({
    ...tab,
    _key: `${tab.id}~`,
    active: !!tab.active,
    closable: !!tab.closable,
    hasIframe: !!tab.hasIframe,
    title: !isPrimitiveType(tab.title) ? markRaw(tab.title as Component) : tab.title.toString(),
    view: markRaw(tab.view),
  }));

  if (0 === cookedTabs.length)
    cookedTabs.push(BlankTab);

  const lastActiveIdex = cookedTabs.findLastIndex((tab) => tab.active);
  const activeIndex = 0 < lastActiveIdex ? lastActiveIdex : 0;

  cookedTabs.forEach((tab, i) => {
    tab.active = activeIndex === i;
  });

  tabGroups[normalizedGroup] = ref(cookedTabs);
  removedTabGroups[normalizedGroup] = [];

  return tabGroups[normalizedGroup] as unknown as Tab[];
}

export function useTabs(group: string) {

  const normalizedGroup = group.trim();
  const tabs = tabGroups[normalizedGroup];

  if (undefined === tabs)
    throw new VueNavTabError(`Group '${normalizedGroup}' is undefined`);

  return tabs as unknown as Tab[];
}

export function useCurrentTab(group: string) {

  const tabs = useTabs(group);

  return computed(() => tabs.find((tab) => tab.active)) as ComputedRef<Tab>;
}

/**
 * Add a tab to a group or replace existed one
 */
export function addTab(group: string, tab: Tab) {

  if (!isValidTab(tab))
    throw new VueNavTabError(MISSING_REQUIRED_PROPS);

  const normalizedGroup = group.trim();
  const tabs = useTabs(normalizedGroup);
  const cookedTab: Tab = {
    ...tab,
    _key: `${tab.id}~`,
    active: !!tab.active,
    closable: !!tab.closable,
    hasIframe: !!tab.hasIframe,
    title: !isPrimitiveType(tab.title) ? markRaw(tab.title as Component) : tab.title.toString(),
    view: markRaw(tab.view),
  };
  let wasRemoved = false;

  for (let i = removedTabGroups[normalizedGroup].length; 0 <= --i;)

    if (removedTabGroups[normalizedGroup][i] === tab.id) {

      wasRemoved = true;
      cookedTab._key = `${cookedTab.id}~${Date.now()}`;
      removedTabGroups[normalizedGroup].splice(i, 1);

      break;
    }

  if (1 === tabs.length && BlankTab.id === tabs[0].id) {

    cookedTab.active = true;
    tabs.splice(0, 1, cookedTab);

    return;
  }

  const currentTab = useCurrentTab(normalizedGroup);
  const idx = tabs.findIndex((_tab) => _tab.id === tab.id);
  const currentTabIdx = tabs.findIndex((_tab) => _tab.id === currentTab.value.id);

  if (cookedTab.active && idx !== currentTabIdx)
    tabs.splice(currentTabIdx, 1, { ...currentTab.value, active: false });

  if (!cookedTab.active && idx === currentTabIdx)
    cookedTab.active = true;

  if (0 > idx || wasRemoved) {
    tabs.push(cookedTab);
  }
  else {
    cookedTab._key = tabs[idx]._key as string;
    tabs.splice(idx, 1, cookedTab);
  }
}

export function removeTab(group: string, tabId: string) {

  const tabs = useTabs(group);
  const idx = tabs.findIndex((tab) => tab.id === tabId);

  if (0 > idx)
    throw new VueNavTabError(`'${tabId}' doesn't exist in group '${group}'`);

  if (!tabs[idx].closable)
    return;

  const currentTab = useCurrentTab(group);
  const currentTabIdx = tabs.findIndex((tab) => tab.id === currentTab.value.id);

  removedTabGroups[group].push(tabId);

  if (1 === tabs.length)
    tabs.push(BlankTab);

  if (idx !== currentTabIdx) {

    tabs.splice(idx, 1);

    return;
  }

  if (currentTab.value.active) {

    const prevTabIdx = currentTabIdx - 1;
    const nextTabIdx = currentTabIdx + 1;

    if (0 > prevTabIdx)
      tabs.splice(nextTabIdx, 1, { ...tabs[nextTabIdx], active: true });
    else
      tabs.splice(prevTabIdx, 1, { ...tabs[prevTabIdx], active: true });
  }

  tabs.splice(currentTabIdx, 1);
}

export function refreshTab(group: string, tabId: string) {

  const tabs = useTabs(group);
  const selectedTabIdx = tabs.findIndex((_tab) => _tab.id === tabId);

  if (0 > selectedTabIdx)
    throw new VueNavTabError(`'${tabId}' doesn't exist in group '${group}'`);

  tabs.splice(selectedTabIdx, 1, { ...tabs[selectedTabIdx], _key: `${tabId}~${Date.now()}` });

  const groupPrefix = `${group.trim()}.`;

  for (const key in tabGroups)
    if (Object.hasOwn(tabGroups, key) && key.startsWith(groupPrefix))
      delete tabGroups[key];
}

function isPrimitiveType(value: unknown) {
  return (
    null === value
    || undefined === value
    || 'bigint' === typeof value
    || 'boolean' === typeof value
    || 'number' === typeof value
    || 'string' === typeof value
    || 'symbol' === typeof value
  );
}

function isValidTab(tab: Tab) {
  return (
    null !== tab && 'object' === typeof tab && !Array.isArray(tab)
    && Object.hasOwn(tab, 'id') && 'string' === typeof tab.id && '' !== tab.id.trim()
    && Object.hasOwn(tab, 'title') && null !== tab.title && ('string' === typeof tab.title || 'function' === typeof tab.title || 'object' === typeof tab.title) && !Array.isArray(tab.title)
    && Object.hasOwn(tab, 'view') && null !== tab.view && ('function' === typeof tab.view || 'object' === typeof tab.view) && !Array.isArray(tab.view)
  );
}

export function removeAll(group: string) {

  const tabs = useTabs(group);
  let currentTabIsRemoved = false;

  for (let i = 0, len = tabs.length; i < len; i++) {

    const tab = tabs[i];

    if (tab.closable) {

      if (!currentTabIsRemoved)
        currentTabIsRemoved = !!tab.active;

      removedTabGroups[group].push(tab.id);
      tabs.splice(i, 1);
      i--;
      len--;
    }
  }

  if (0 === tabs.length)
    tabs.push(BlankTab);
  else if (currentTabIsRemoved)
    tabs.splice(0, 1, { ...tabs[0], active: true });
}

export function removeLeft(group: string, tabId: string) {

  const tabs = useTabs(group);
  let idx = tabs.findIndex((tab) => tab.id === tabId);

  if (0 > idx)
    throw new VueNavTabError(`'${tabId}' doesn't exist in group '${group}'`);

  let currentTabIsRemoved = false;

  for (let i = 0; i < idx; i++) {

    const tab = tabs[i];

    if (tab.closable) {

      if (!currentTabIsRemoved)

        currentTabIsRemoved = !!tab.active;

      removedTabGroups[group].push(tab.id);
      tabs.splice(i, 1);
      i--;
      idx--;
    }
  }

  if (currentTabIsRemoved)
    tabs.splice(idx, 1, { ...tabs[idx], active: true });
}

export function removeRight(group: string, tabId: string) {

  const tabs = useTabs(group);
  const idx = tabs.findIndex((tab) => tab.id === tabId);

  if (0 > idx)
    throw new VueNavTabError(`'${tabId}' doesn't exist in group '${group}'`);

  let currentTabIsRemoved = false;

  for (let i = idx + 1, len = tabs.length; i < len; i++) {

    const tab = tabs[i];

    if (tab.closable) {

      if (!currentTabIsRemoved)

        currentTabIsRemoved = !!tab.active;

      removedTabGroups[group].push(tab.id);
      tabs.splice(i, 1);
      i--;
      len--;
    }
  }

  if (currentTabIsRemoved)
    tabs.splice(idx, 1, { ...tabs[idx], active: true });
}

export function removeOthers(group: string, tabId: string) {

  removeLeft(group, tabId);
  removeRight(group, tabId);
}

export function removeAbove(group: string, tabId: string) {
  removeLeft(group, tabId);
}

export function removeBelow(group: string, tabId: string) {
  removeRight(group, tabId);
}

export function onTabActivated(group: string, callback: (currentTab: Tab) => void) {

  const currentTab = toRaw(useCurrentTab(group).value);

  onActivated(() => callback(currentTab));
}

export function onTabDeactivated(group: string, callback: (lastTab: Tab) => void) {

  const currentTab = toRaw(useCurrentTab(group).value);

  onDeactivated(() => callback(currentTab));
}
