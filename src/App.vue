<script lang="ts">
import { addTab, createTabs } from "../lib";
import { defineAsyncComponent, defineComponent } from "vue";

import Home from "./components/Home.vue";
import HomeTab from "./components/HomeTab.vue";

const HelloWorld = defineAsyncComponent(() => import("./components/HelloWorld.vue"));
const Profile = defineAsyncComponent(() => import("./components/Profile.vue"));

export default defineComponent({
  name: "App",
  setup() {
    let tabCount = 1;
    const group = "base";
    const tabs = createTabs(group, [
      {
        active: true,
        closable: false,
        id: "home",
        title: HomeTab,
        view: Home,
      },
      {
        active: false,
        closable: true,
        id: "profile",
        title: "Profile",
        view: Profile,
      },
    ]);

    function addNewTab() {
      const id = Math.random();

      addTab(group, {
        active: true,
        closable: 0.5 <= id,
        hoverTitle: "New tab " + tabCount,
        id: "new" + id,
        title: "New tab " + tabCount,
        view: HelloWorld,
        viewProps: { msg: "New tab " + tabCount++, tabGroup: group },
      });
    }

    function openProfile() {

      addTab(group, {
        active: true,
        closable: true,
        id: "profile",
        title: "Profile",
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
  <div class="vp-container vp-mx-auto">
    <div class="vp-mb-3">
      <button type="button" @click="addNewTab">add new tab</button>
      <button type="button" @click="openProfile">open profile</button>
    </div>

    <h-tabs :group="group" :tabs="tabs" />

    <tab-view :group="group" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
  text-align: center;
}
</style>