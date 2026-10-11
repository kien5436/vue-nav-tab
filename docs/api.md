##### Tab

```ts
interface Tab {
  active?: boolean; // set default active tab, only one tab is active at a time. If there are no active tabs, the first tab becomes active. If there are more than one active tab, the last active tab becomes active
  closable?: boolean; // tab can be closed or not
  id: string; // unique id for the tab
  title: string | Component | VNode; // tab's title, can be a string or complex component
  hoverTitle?: string; // provide tooltips when hovering over the tab
  titleProps?: unknown; // passing `props` to title if it is a component
  hasIframe?: boolean; // use it when your view contains iframe(s)
  view: Component | VNode; // the view which will be displayed in <tab-view />
  viewProps?: unknown; // passing `props` if your view need some props from parent component
}
```

##### createTabs

- `createTabs(group: string, tabs: Tab[]): Tab[]`

Initialize first tabs to display on page. You can leave `tabs` as an empty array, an empty tab will be inserted to reserved for which tab is added later.

If you want to create nested tabs, such as `child` inside `parent`, use the dotted path as group name. E.g:

```js
createTabs('parent', parentTabs)
createTabs('parent.child', childTabs)
```

Note that you can only initialize tabs for a `group` once or this function will throw an error.

Returned tabs will be used by `HTabs/VTabs` components.

##### useTabs

- `useTabs(group: string): Tab[]`

Get all tabs of a `group`. Useful when you need to retrieve tabs in other component than the one which created the tabs.

##### useCurrentTab

- `useCurrentTab(group: string): ComputedRef<Tab>`

Retrieve the current tab.

##### addTab

- `addTab(group: string, tab: Tab): void`

Add or replace existing tab in created `group`.

You can use this function to open a tab programmatically as shown in [example](quick-start.md#quick-example).

##### removeTab

- `removeTab(group: string, tabId: string): void`

Remove a specific tab in a `group`. A tab with `closable = false` can't be removed.

##### removeAll

- `removeAll(group: string): void`

Remove all `closable` tabs in a `group`.

##### removeLeft

- `removeLeft(group: string, tabId: string): void`

Remove all `closable` tabs to the left of `tabId` in a `group`.

##### removeRight

- `removeRight(group: string, tabId: string): void`

Remove all `closable` tabs to the right of `tabId` in a `group`.

##### removeAbove

- `removeAbove(group: string, tabId: string): void`

Remove all `closable` tabs to the above of `tabId` in a `group`.

##### removeBelow

- `removeBelow(group: string, tabId: string): void`

Remove all `closable` tabs to the below of `tabId` in a `group`.

##### removeOthers

- `removeOthers(group: string, tabId: string): void`

Remove all tabs in a `group` except the tab with `tabId` and non-`closable` tabs.

##### refreshTab

- `refreshTab(group: string, tabId: string): void`

Refresh a specific tab in a `group`. By default, when you switch between tabs, their states is preserved. This function helps you get rid of stale data in the tab.

##### onTabActivated

- `onTabActivated(group: string, callback: (currentTab: Tab) => void): void`

Triggered whenever a tab is visible to the user. Useful when you want to do some actions, e.g. add event listeners when activate a tab.

##### onTabDeactivated

- `onTabDeactivated(group: string, callback: (lastTab: Tab) => void): void`

Triggered whenever a tab is invisible to the user. Useful when you want to do some actions, e.g. clean event listeners attached to component when it was mounted.
