<script lang="ts">
import { defineComponent } from "vue";

import { Tab, createTabs } from "../../lib";
import HelloWorld from "./HelloWorld.vue";

export default defineComponent({
  name: "Home",
  setup() {

    const group = "base.home";
    const tabsList: Tab[] = [];

    for (let i = 1; 50 > i; i++) {

      tabsList.push({
        active: 1 === i,
        closable: true,
        id: i.toString(),
        title: `nested tab ${i}`,
        view: HelloWorld,
        viewProps: { msg: `hello nested tab ${i}`, tabGroup: group },
      });
    }

    const tabs = createTabs(group, tabsList);

    return {
      group,
      tabs,
    };
  },
});
</script>


<template>
  <div class="container vp-mx-auto vp-p-3 vp-flex">
    <v-tabs class="vp-h-52 vp-w-40 vp-mr-3" :group="group" :tabs="tabs" />

    <tab-view :group="group" />
  </div>
</template>