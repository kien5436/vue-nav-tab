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

<div
  class="vp-overflow-hidden vp-h-10 vp-relative before:vp-bottom-px before:vp-content-[''] before:vp-block before:vp-absolute before:vp-left-0 before:vp-w-full before:vp-h-px before:vp-bg-gray-300">
  <div class="vp-h-full vp-overflow-x-auto vp-overflow-y-hidden -vp-mb-4 vp-pb-4 vp-box-content">
    <nav
      class="vp-flex vp-flex-nowrap vp-border-0 vp-m-0 vp-p-0 vp-h-10 vp-box-border vp-bg-transparent vp-select-none vp-relative vp-nav vp-tabs">
      <a class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-4 vp-justify-center vp-top-0"
        id="home-tab" draggable="true" style="left: 0px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border">
          <span>Home</span></div>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-item-active vp-pr-8 vp-justify-start vp-top-0"
        id="profile-tab" draggable="true" style="left: 76.9px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>Profile</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-8 vp-justify-start vp-top-0"
        id="new0.6519176948604652-tab" draggable="true" title="New tab 1" style="left: 171.95px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>New tab 1</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-8 vp-justify-start vp-top-0"
        id="new0.6763029582886492-tab" draggable="true" title="New tab 2" style="left: 294.2px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>New tab 2</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a>
    </nav>
  </div>
</div>

  - pills

<div
  class="vp-overflow-hidden vp-h-10 vp-relative">
  <div class="vp-h-full vp-overflow-x-auto vp-overflow-y-hidden -vp-mb-4 vp-pb-4 vp-box-content">
    <nav
      class="vp-flex vp-flex-nowrap vp-border-0 vp-m-0 vp-p-0 vp-h-10 vp-box-border vp-bg-transparent vp-select-none vp-relative vp-nav vp-pills">
      <a class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-4 vp-justify-center vp-top-0"
        id="home-tab" draggable="true" style="left: 0px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border">
          <span>Home</span>
        </div>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-item-active vp-pr-8 vp-justify-start vp-top-0"
        id="profile-tab" draggable="true" style="left: 74.9px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>Profile</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-8 vp-justify-start vp-top-0"
        id="new0.777959157607818-tab" draggable="true" title="New tab 1" style="left: 167.95px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>New tab 1</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-8 vp-justify-start vp-top-0"
        id="new0.7425732870384805-tab" draggable="true" title="New tab 2" style="left: 288.2px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>New tab 2</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a>
    </nav>
  </div>
</div>

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

<div
  class="vp-overflow-hidden vp-h-10 vp-relative before:vp-bottom-px before:vp-content-[''] before:vp-block before:vp-absolute before:vp-left-0 before:vp-w-full before:vp-h-px before:vp-bg-gray-300">
  <div class="vp-h-full vp-overflow-x-auto vp-overflow-y-hidden -vp-mb-4 vp-pb-4 vp-box-content">
    <nav
      class="vp-flex vp-flex-nowrap vp-border-0 vp-m-0 vp-p-0 vp-h-10 vp-box-border vp-bg-transparent vp-select-none vp-relative vp-nav vp-tabs">
      <a class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-4 vp-justify-center vp-top-0"
        id="home-tab" draggable="true" style="left: 0px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border">
          <span>Home</span></div>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-item-active vp-pr-8 vp-justify-start vp-rounded-t vp-top-0"
        id="profile-tab" draggable="true" style="left: 76.9px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>Profile</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-8 vp-justify-start vp-top-0"
        id="new0.6519176948604652-tab" draggable="true" title="New tab 1" style="left: 171.95px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>New tab 1</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a><a
        class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item vp-pr-8 vp-justify-start vp-top-0"
        id="new0.6763029582886492-tab" draggable="true" title="New tab 2" style="left: 294.2px;">
        <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border"><span>New tab 2</span></div><span
          class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"><i
            class="vp-icon vp-icon-x"></i></span>
      </a>
    </nav>
  </div>
</div>

### VTabs

```html
<v-tabs :group="" :tabs="" rounded>...</v-tabs>
```

Similar to `HTabs` but tabs are displayed vertically. `VTabs` uses "pills" style only.

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
      view: Home,
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
  <img src="/favicon.ico" />
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
