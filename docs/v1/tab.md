#### Props

```html
<tab :group="" :tab-id="" active closable rounded>...</tab>
```

##### group

- Required
- Type: `string`

A tab must belong to a group. If your page contains multiple tabs or has nested tabs, it can determine which tab to interact with.

##### tabId

- Required
- Type: `string`

Unique id for each tab

##### active

- Optional
- Type: `boolean`
- Default: `false`

If set to `true`, the view corresponding with this tab will be shown

##### closable

- Optional
- Type: `boolean`
- Default: `false`

Mark the tab can be closed or not

##### rounded

- Optional
- Type: `boolean`
- Default: `false`

If set to `true`, the tab will have rounded border like Chrome tab

##### Addtional props

You can set any standard attribute of an `HTMLElement` for `tab`.

If you only need a string as tab's title, you can simply use `title` variable:

```vue
<script>
export default {
  data() {
    return { title: 'Home' };
  },
};
</script>

<template>
  <tab :group="" :tab-id="">{{ title }}</tab>
</template>
```

If you want a tab with icon like browser tab, you can pass your custom title like this:

```html
<tab :group="" :tab-id="">
  <img src="https://www.google.com/favicon.ico" />
  <span>Google</span>
</tab>
```
