import { Component, ComputedRef, Ref, VNode, computed, markRaw, reactive, ref } from "vue";

import VueNavTabError, { MISSING_REQUIRED_PROPS } from "./error";
import BlankTabView from "./components/BlankTabView.vue";

export interface Tab {
  _key?: string;
  active?: boolean;
  closable?: boolean;
  id: string;
  title: string | Component | VNode;
  view: Component | VNode;
  viewProps?: unknown;
}

const tabsGroup: { [key: string]: Ref<Tab[]> } = reactive({});
const removedTabsGroup: { [key: string]: string[] } = {};
const BlankTab: Tab = {
  active: true,
  id: "_",
  title: "Blank",
  view: markRaw(BlankTabView),
};

export function createTabs(group: string, tabs: Tab[]) {

  if (!Array.isArray(tabs)) {
    throw new VueNavTabError("'tabs' must be an array");
  }

  if (tabsGroup.hasOwnProperty(group)) {
    throw new VueNavTabError(`'${group}' was created. If you want to add more tabs into it, use 'addTab' instead`);
  }

  if (tabs.some((_tab) => !isValidTab(_tab))) {
    throw new VueNavTabError(MISSING_REQUIRED_PROPS);
  }

  const _tabs = ref<Tab[]>(
    tabs.map((tab) => ({
      ...tab,
      _key: tab.id,
      active: !!tab.active,
      closable: !!tab.closable,
      title: !isPrimitiveType(tab.title) ? markRaw(tab.title as Component) : tab.title.toString(),
      view: markRaw(tab.view),
    }))
  );

  if (0 === _tabs.value.length) {
    _tabs.value.push(BlankTab);
  }

  tabsGroup[group] = _tabs;
  removedTabsGroup[group] = [];

  return tabsGroup[group] as unknown as Tab[];
}

export function useTabs(group: string) {

  const tabs = tabsGroup[group];

  if (undefined === tabs) {
    throw new VueNavTabError(`Group '${group}' is undefined`);
  }

  return tabs as unknown as Tab[];
}

export function useCurrentTab(group: string) {

  const tabs = useTabs(group);

  return computed(() => tabs.find((tab) => tab.active)) as ComputedRef<Tab>;
}

/**
 * Add a tab to a group or replace existed one
 * @param group group that tab is added
 * @param tab the tab to be added
 */
export function addTab(group: string, tab: Tab) {

  if (!isValidTab(tab)) {
    throw new VueNavTabError(MISSING_REQUIRED_PROPS);
  }

  const tabs = useTabs(group);
  const cookedTab = {
    ...tab,
    _key: tab.id,
    active: !!tab.active,
    closable: !!tab.closable,
    title: !isPrimitiveType(tab.title) ? markRaw(tab.title as Component) : tab.title.toString(),
    view: markRaw(tab.view),
  };
  let wasRemoved = false;

  for (let i = removedTabsGroup[group].length; 0 <= --i;) {

    if (removedTabsGroup[group][i] === tab.id) {

      wasRemoved = true;
      cookedTab._key = cookedTab.id + Date.now();
      removedTabsGroup[group].splice(i, 1);
      break;
    }
  }

  if (1 === tabs.length && BlankTab.id === tabs[0].id) {

    cookedTab.active = true;
    tabs.splice(0, 1, cookedTab);
    return;
  }

  const currentTab = useCurrentTab(group);
  const idx = tabs.findIndex((_tab) => _tab.id === tab.id);
  const currentTabIdx = tabs.findIndex((_tab) => _tab.id === currentTab.value.id);

  if (cookedTab.active && idx !== currentTabIdx) {

    tabs.splice(currentTabIdx, 1, { ...currentTab.value, active: false });
  }

  if (!cookedTab.active && idx === currentTabIdx) {
    cookedTab.active = true;
  }

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
  const currentTab = useCurrentTab(group);
  const idx = tabs.findIndex((tab) => tab.id === tabId);
  const currentTabIdx = tabs.findIndex((tab) => tab.id === currentTab.value.id);

  if (0 > idx) {
    return;
  }

  removedTabsGroup[group].push(tabId);

  if (1 === tabs.length) {

    tabs.push(BlankTab);
  }

  if (idx !== currentTabIdx) {

    tabs.splice(idx, 1);
    return;
  }

  if (currentTab.value.active) {
    const prevTabIdx = currentTabIdx - 1;
    const nextTabIdx = currentTabIdx + 1;

    if (0 > prevTabIdx) {
      tabs.splice(nextTabIdx, 1, { ...tabs[nextTabIdx], active: true });
    }
    else {
      tabs.splice(prevTabIdx, 1, { ...tabs[prevTabIdx], active: true });
    }
  }

  tabs.splice(currentTabIdx, 1);
}

export function refreshTab(group: string, tabId: string) {

  const tabs = useTabs(group);
  const selectedTabIdx = tabs.findIndex((_tab) => _tab.id === tabId);

  if (0 > selectedTabIdx) {
    throw new VueNavTabError(`'${tabId}' doesn't exist in group '${group}'`);
  }

  tabs.splice(selectedTabIdx, 1, { ...tabs[selectedTabIdx], _key: tabId + Date.now() });
}

function isPrimitiveType(value: unknown) {
  return (
    null === value ||
    undefined === value ||
    "bigint" === typeof value ||
    "boolean" === typeof value ||
    "number" === typeof value ||
    "string" === typeof value ||
    "symbol" === typeof value
  );
}

function isValidTab(tab: Tab) {
  return tab.hasOwnProperty("id") && tab.hasOwnProperty("title") && tab.hasOwnProperty("view");
}