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
    const group = "base";
    const tabs = createTabs(group, [
      {
        active: true,
        closable: true,
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
        closable: true,
        id: "new" + id,
        title: "new tab " + id,
        view: HelloWorld,
        viewProps: { msg: "new tab " + id },
      });
    }

    function onTabChanged(tabId:string, prevTabId: string) {
      console.debug(`App.vue:69: tab was changed from ${prevTabId} to ${tabId}`);
    }

    function onCloseTab(tabId: string) {
      console.debug("App.vue:73: close tab", tabId);
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
      onCloseTab,
      onTabChanged,
      openProfile,
      tabs,
    };
  },
});
</script>

<template>
  <div class="vp-container vp-mx-auto">
    <button type="button" @click="addNewTab">add new tab</button>
    <button type="button" @click="openProfile">open profile</button>
    <h-nav class="nav-tabs">
      <tab
        v-for="tab in tabs"
        :key="tab.id"
        :tab-id="tab.id"
        :active="tab.active"
        :closable="tab.closable"
        :group="group"
      >
        <span v-if="typeof tab.title === 'string'">
          {{ tab.title }}
        </span>
        <component :is="tab.title" v-else />
      </tab>
    </h-nav>

    <tab-view :group="group" />
  </div>
</template>

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