import { Component, ComputedRef, VNode } from "vue";
export interface Tab {
    _key?: string;
    active?: boolean;
    closable?: boolean;
    id: string;
    title: string | Component | VNode;
    view: Component | VNode;
    viewProps?: unknown;
}
export declare function createTabs(group: string, tabs: Tab[]): Tab[];
export declare function useTabs(group: string): Tab[];
export declare function useCurrentTab(group: string): ComputedRef<Tab>;
/**
 * Add a tab to a group or replace existed one
 * @param group group that tab is added
 * @param tab the tab to be added
 */
export declare function addTab(group: string, tab: Tab): void;
export declare function removeTab(group: string, tabId: string): void;
export declare function refreshTab(group: string, tabId: string): void;
