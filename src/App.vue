<template>
  <div class="container">
    <button type="button" @click="addNewTab">add new tab</button>
    <h-nav class="nav-tabs">
      <tab
        v-for="tab in tabs"
        :key="tab.id"
        :tab-id="tab.id"
        :active="tab.active"
        :closable="tab.closable"
        group="base"
      >
        <span v-if="typeof tab.title === 'string'">
          {{ tab.title }}
        </span>
        <component :is="tab.title" v-else />
      </tab>
    </h-nav>

    <tab-view group="base" />
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";
import { createTabs, addTab } from "../lib";

import Home from "./components/Home.vue";
import HomeTab from "./components/HomeTab.vue";

const HelloWorld = defineAsyncComponent(
  () => import("./components/HelloWorld.vue")
);
const Profile = defineAsyncComponent(() => import("./components/Profile.vue"));

export default defineComponent({
  name: "App",
  setup() {
    const tabs = createTabs("base", [
      {
        id: "home",
        active: true,
        closable: true,
        title: HomeTab,
        view: Home,
      },
      {
        id: "profile",
        active: false,
        closable: true,
        title: "Profile",
        view: Profile,
      },
    ]);

    function addNewTab() {
      const id = Math.random();

      addTab("base", {
        id: "new" + id,
        title: "new tab " + id,
        view: HelloWorld,
        viewProps: { msg: "new tab " + id },
        active: true,
        closable: true,
      });
    }

    return { tabs, addNewTab };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
