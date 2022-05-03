> *v1.x is deprecated due to many bugs and lack of features*

#### Prerequisites

- You are familiar with `Vue.js` and `Vue Single-File Components`.
- This guide will use `ES modules` syntax for consistency. If you don't know about it, don't worry, you can start with [vue-cli](https://cli.vuejs.org/guide/installation.html), it will setup necessary things for your project.

#### [Live demo](https://codesandbox.io/s/vue-nav-tab-2-example-vkl1uh)

#### Quick example

Now, I assume that you use `vue-cli` to create project. Let's modify something.

`main.js`

```js
import { createApp } from 'vue';
import 'vue-nav-tab/dist/vue-nav-tab.css';
import VueNavTab from 'vue-nav-tab';

import App from './App.vue';

createApp(App).use(VueNavTab).mount('#app');
```

`App.vue`

```vue
<script>
import { addTab, createTabs } from 'vue-nav-tab';
import { defineComponent } from 'vue';

import HelloWorld from './components/HelloWorld.vue';
import Profile from './components/Profile.vue';

export default defineComponent({
  name: 'App',
  setup() {
    const group = 'base';
    const tabs = createTabs(group, [
      {
        active: true,
        closable: false,
        id: 'home',
        title: 'Home',
        view: HelloWorld,
        viewProps: { msg: 'Hello world from Home' },
      },
    ]);

    function addNewTab() {
      const id = Math.random();

      addTab(group, {
        active: true,
        closable: true,
        id: 'new' + id,
        title: 'New tab ' + id,
        view: HelloWorld,
        viewProps: { msg: 'new tab ' + id },
      });
    }

    function openProfile() {
      addTab(group, {
        active: true,
        closable: true,
        id: 'profile',
        title: 'Profile',
        view: Profile,
      });
    }

    return {
      addNewTab,
      group,
      openProfile,
      tabs,
    };
  },
});
</script>

<template>
  <div class="container">
    <button type="button" @click="addNewTab">add new tab</button>
    <button type="button" @click="openProfile">open profile</button>

    <h-tabs :group="group" :tabs="tabs" />

    <tab-view :group="group" />
  </div>
</template>
```

Next, create `Profile` component in `src/components/Profile.vue`:

```vue
<script>
import { defineComponent, ref } from 'vue';
import { refreshTab } from 'vue-nav-tab';

export default defineComponent({
  name: 'Profile',
  setup() {
    const count = ref(0);

    function refreshThisTab() {
      refreshTab("base", "profile");
    }

    return { count, refreshThisTab };
  },
});
</script>

<template>
  <h1>Profile</h1>
  <p>
    You click button <span style="color:#f00">{{ count }}</span> times
  </p>
  <button type="button" @click="count++">increase</button>
  <button type="button" @click="refreshThisTab">reload this tab (or try tab context menu)</button>
</template>
```

Open a terminal/cmd, type `npm run serve` and see the result in browser.
