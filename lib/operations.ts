import {
  markRaw,
  reactive,
  ref,
  computed,
  ComputedRef,
  Component,
  VNode,
} from "vue";

export interface Tab {
  active?: boolean;
  closable?: boolean;
  id: string;
  title: string | Component | VNode;
  view: Component | VNode;
  viewProps?: any;
}

const tabGroup = reactive<{ [key: string]: any }>({});

export function createTabs(group: string, tabs: Tab[]): Tab[] {
  if (!Array.isArray(tabs)) {
    throw Error("'tabs' must be an array");
  }

  const _tabs = ref<Tab[]>(
    tabs.map((tab) => ({
      ...tab,
      active: !!tab.active,
      closable: !!tab.closable,
      title: !isPrimitiveType(tab.title)
        ? markRaw(tab.title as Component)
        : tab.title.toString(),
      view: markRaw(tab.view),
    }))
  );

  tabGroup[group] = _tabs;

  return tabGroup[group];
}

export function useTabs(group: string): Tab[] {
  return tabGroup[group];
}

export function useCurrentTab(group: string): ComputedRef<Tab> {
  return computed(() =>
    tabGroup[group].find((tab: Tab) => tab.active)
  ) as ComputedRef<Tab>;
}

export function addTab(group: string, tab: Tab): void {
  const tabs = tabGroup[group];
  const _tab = {
    ...tab,
    active: !!tab.active,
    closable: !!tab.closable,
    view: markRaw(tab.view),
    title: !isPrimitiveType(tab.title)
      ? markRaw(tab.title as Component)
      : tab.title.toString(),
  };

  if (tabs.length === 1 && tabs[0].id === "_") {
    tabs.splice(0, 1, _tab);
    return;
  }

  if (!tab.active) {
    tabs.push(_tab);
    return;
  }

  const currentTab = useCurrentTab(group);
  const currentTabIdx = tabs.findIndex(
    (tab: Tab) => tab.id === currentTab.value.id
  );

  tabs.splice(currentTabIdx, 1, { ...currentTab.value, active: false });
  tabs.push(_tab);
}

function isPrimitiveType(value: unknown) {
  return (
    null === value ||
    undefined === value ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "symbol"
  );
}
