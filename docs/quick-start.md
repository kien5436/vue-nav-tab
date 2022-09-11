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
import "bulma/css/bulma.min.css";
import { addTab, createTabs } from "vue-nav-tab";

import HelloWorld from "./components/HelloWorld.vue";
import Profile from "./components/Profile.vue";
import Home from "./components/Home.vue";

export default {
  name: "App",
  setup() {
    let tabCount = 1;
    const group = "base";
    const tabs = createTabs(group, [
      {
        active: true,
        closable: false,
        id: "home",
        title: "Home",
        hoverTitle: "Home",
        view: Home,
      },
    ]);

    function addNewTab() {
      const id = Math.random();

      addTab(group, {
        active: true,
        closable: true,
        id: "new" + id,
        title: "New tab " + tabCount,
        hoverTitle: "New tab " + tabCount,
        view: HelloWorld,
        viewProps: { msg: "new tab " + tabCount++ },
      });
    }

    function openProfile() {
      addTab(group, {
        active: true,
        closable: true,
        id: "profile",
        title: "Profile",
        hoverTitle: "Profile",
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
};
</script>

<template>
  <div class="container p-3">
    <div class="field is-grouped">
      <p class="control">
        <button type="button" class="button is-small" @click="addNewTab">
          Add new tab
        </button>
      </p>
      <p class="control">
        <button type="button" class="button is-small" @click="openProfile">
          Open "Profile" tab
        </button>
      </p>
    </div>

    <h-tabs :group="group" :tabs="tabs" rounded />

    <tab-view :group="group" style="height: 400px" />
  </div>
</template>
```

Next, create `Profile` and `Home` component:

`src/components/Profile.vue`:

```vue
<script>
import { ref } from "vue";
import { refreshTab } from "vue-nav-tab";

export default {
  name: "Profile",
  setup() {
    const count = ref(0);

    function refreshThisTab() {
      refreshTab("base", "profile");
    }

    return { count, refreshThisTab };
  },
};
</script>

<template>
  <div class="content p-3">
    <h1>Profile</h1>
    <p>
      You click button <span class="has-text-danger">{{ count }}</span> times
    </p>
    <button type="button" class="button is-small" @click="count++">
      Increase
    </button>
    <button type="button" class="button is-small" @click="refreshThisTab">
      Reload this tab (or try tab context menu)
    </button>
  </div>
</template>
```

`src/components/Home.vue`

```vue
<script>
export default {
  name: "Home",
};
</script>

<template>
  <iframe
    src="https://kien5436.github.io/vue-nav-tab/"
    width="100%"
    height="100%"
    frameborder="0"
  ></iframe>
</template>
```

Open a terminal/cmd, type `npm run serve` and see the result in browser.
