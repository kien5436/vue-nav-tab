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

    // let nextId = 1;
    function getId() {
      // return nextId++;
      return Math.random();
    }

    function addNewTab() {
      const id = getId();

      addTab(group, {
        active: true,
        closable: 0.5 <= id,
        hoverTitle: "new tab " + id,
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

    function setTabChanged(currentSelection: any, previousSelection: any) {
      console.log("tab changed from " + previousSelection.id + " to " + currentSelection.id);
    }


    return {
      addNewTab,
      group,
      onCloseTab,
      onTabChanged,
      openProfile,
      tabs,
      setTabChanged,
    };
  },
});
</script>

<template>
  <div class="vp-container vp-mx-auto">
    <button type="button" @click="addNewTab">add new tab</button>
    <button type="button" @click="openProfile">open profile</button>

    <h-tabs :group="group" :tabs="tabs" @tab-changed="setTabChanged" />

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