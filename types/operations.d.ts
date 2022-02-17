import { ComputedRef, Component, VNode } from "vue";
export interface Tab {
    active?: boolean;
    closable?: boolean;
    id: string;
    title: string | Component | VNode;
    view: Component | VNode;
    viewProps?: any;
}
export declare function createTabs(group: string, tabs: Tab[]): Tab[];
export declare function useTabs(group: string): Tab[];
export declare function useCurrentTab(group: string): ComputedRef<Tab>;
export declare function addTab(group: string, tab: Tab): void;
