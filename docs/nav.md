Navigation component contains all tabs in a group.

There are two types of navbar: horizontal and vertical.

### HTabs

#### Props

```html
<h-tabs :group="" :tabs="" :appearance="" :position="" rounded>...</h-tabs>
```

##### group

- Required
- Type: `string`

A tab must belong to a group. If your page contains multiple tabs or has nested tabs, it can determine which tab to interact with.

##### tabs

- Required
- Type: `Tab[]`

List of tabs. For details, see [Tab interface](api.md#tab).

##### appearance

- Optional
- Type: `string "tabs" | "pills"`
- Default: `"tabs"`

  - tabs

  ![hnav tabs](_media/hnav-tabs.png ':size=autox50')

  - pills

  ![hnav pills](_media/hnav-pills.png ':size=autox50')

You can also combine with tab's `rounded` prop.

![hnav pills](_media/hnav-pills-rounded.png ':size=autox50')

If you want to custom how tabs look like, you can use `style` or `class` props to override default CSS.

##### position

- Optional
- Type: `string "top" | "bottom"`
- Default: `"bottom"`

Set navbar **border** is above or below tab view. Don't be confused that it will set the position for tabs in the page. This library is designed for easy customization so where to place the elements is up to you.

##### rounded

- Optional
- Type: `boolean`
- Default: `false`

If set to `true`, the tab will have rounded border like Chrome tab

### VTabs

```html
<v-tabs :group="" :tabs="" rounded>...</v-tabs>
```

Similar to `HTabs` but tabs are displayed vertically. By default, `VTabs` uses "pills" style.

##### Addtional props

You can set any standard attribute of an `HTMLElement` for these components.

Tab's title can be a string-like or a component. As you notice the usage in quick example:

```vue
<script>
export default {
  setup() {
    const group = 'group';
    const tabs = createTabs(group, [{
      active: true,
      closable: false,
      id: 'home',
      title: 'Home',
      view: HelloWorld,
    }]);
...
  }
};
</script>
```

If you want a tab with icon like browser tab, you can pass your custom component like this:

`components/CustomTitle.vue`

```html
<template>
  <img src="https://www.google.com/favicon.ico" />
  <span>Custom tab title</span>
</template>
```

`App.vue`

```vue
<script>
import CustomTitle from './components/CustomTitle.vue';
...
const tabs = createTabs(group, [{
  ...
  title: CustomTitle,
}]);
...
</script>
```
