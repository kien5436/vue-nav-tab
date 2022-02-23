##### Tab

```js
interface Tab {
  active?: boolean;
  closable?: boolean;
  id: string;
  title: string | Component | VNode;
  view: Component | VNode;
  viewProps?: unknown;
}
```

##### createTabs

- `createTabs(group: string, tabs: Tab[]): Tab[]`

Initialize first tabs to display on page. You can leave `tabs` as an empty array, an empty tab will be set to reserved for which tab is added later.

Returned tabs will be used by `<tab>` components.

##### useTabs

- `useTabs(group: string): Tab[]`

Get all tabs of `group`. Useful when you need to retrieve tabs in other component than the one which created the tabs.

##### useCurrentTab

- `useCurrentTab(group: string): ComputedRef<Tab>`

Retrieve the current tab.

##### addTab

- `addTab(group: string, tab: Tab): void`

Add or replace existing tab in `group`.

You can use this function to open a tab programmatically like [example](quick-start.md#quick-example).

##### removeTab

- `removeTab(group: string, tabId: string): void`

Remove specific tab in `group`.

##### refreshTab

- `refreshTab(group: string, tabId: string): void`

Refresh specific tab in `group`. By default, when you switch between tabs, their states is preserved. This function helps you get rid of stale data in the tab.
