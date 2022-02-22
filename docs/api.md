##### Tab

```js
interface Tab {
  active?: boolean; // set default active tab, only one tab is active at a time
  closable?: boolean; // tab can be closed or not
  id: string; // unique id for the tab
  title: string | Component | VNode; // tab's title, can be a string or complex component
  view: Component | VNode; // the view which will be displayed in <tab-view />
  viewProps?: unknown; // passing `props` if your view need some props from parent component
}
```

##### createTabs

- `createTabs(group: string, tabs: Tab[]): Tab[]`

Initialize first tabs to display on page. You can leave `tabs` as an empty array, an empty tab will be set to reserved for which tab is added later.

Note that you can only initialize tabs for a `group` once or this function will throw an error.

Returned tabs will be used by `<tab>` components.

##### useTabs

- `useTabs(group: string): Tab[]`

Get all tabs of `group`. Useful when you need to retrieve tabs in other component than the one which created the tabs.

##### useCurrentTab

- `useCurrentTab(group: string): ComputedRef<Tab>`

Retrieve the current tab.

##### addTab

- `addTab(group: string, tab: Tab): void`

Add or replace existing tab in created `group`.

You can use this function to open a tab programmatically like [example](quick-start.md#quick-example).

##### removeTab

- `removeTab(group: string, tabId: string): void`

Remove specific tab in `group`. A tab with `closable = false` can't be removed.

##### refreshTab

- `refreshTab(group: string, tabId: string): void`

Refresh specific tab in `group`. By default, when you switch between tabs, their states is preserved. This function helps you get rid of stale data in the tab.
