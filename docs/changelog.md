##### v2.2.1

- Fix drag'n'drop error when dragged into other elements

##### v2.2.0

- Add drag'n'drop feature
- Support tooltips when hovering over a tab

##### v2.1.0

- Support i18n for context menu

##### v2.0.2

- Fix `remove*` functions can't set active tab

##### v2.0.1

- Show active tab when open from API
- Fix `remove*` functions remove `closable` tabs

##### v2.0.0

> Breaking change

Tab context menu in v1.x just works but have a problem when you select more than one tab; it is also somewhat semantically incorrect when used with `v-nav`. So I re-design it for better UI/UX.

In addition, the use of tabs has been changed. The `<tab />` component is no longer exposed, you can instead use `<h-tabs />` for horizontal tabs or `<v-tabs />` for vertical tabs. Therefore, you write less code.

- Fix tab context menu display position
- Fix multiple context menus are shown when select multiple tabs
- Update tab refresh behavior

##### v1.2.0

- Control tab's action via context menu

##### v1.1.1

- Fix package's module type couldn't be rendered
- Fix cached tab refresh

##### v1.1.0

- Add refresh operation
- Rebuild package

##### v1.0.1

- Change the name due to conflict with other package

##### v1.0.0

- Create tabs UI
- Tabs operation: open, close
