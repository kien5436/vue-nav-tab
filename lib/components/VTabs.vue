<script lang="ts">
import { defineComponent, ref } from "vue";

import { refreshTab, removeAll, removeLeft, removeOthers, removeRight, removeTab } from "../operations";
import ContextMenu from "./ContextMenu.vue";
import Tab from "./Tab.vue";

export default defineComponent({
  name: "VTabs",
  components: { ContextMenu, Tab },
  props: {
    group: {
      required: true,
      type: String,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    tabs: {
      required: true,
      type: Array,
    },
  },
  setup(props) {
    const contextMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
    const tabContext = ref<string | null>(null);
    const actions = [
      {
        id: "reload",
        text: "Reload",
      },
      {
        id: "close",
        text: "Close",
      },
      {
        id: "closeAll",
        text: "Close all",
      },
      {
        id: "closeOthers",
        text: "Close others",
      },
      {
        id: "closeAbove",
        text: "Close to the above",
      },
      {
        id: "closeBelow",
        text: "Close to the below",
      },
    ];

    function showContextMenu(e: MouseEvent, tabId: string) {

      contextMenu.value?.open(e);
      tabContext.value = tabId;
    }

    function onMenuClick(actionId: string) {

      contextMenu.value?.close();

      if (!tabContext.value) {
        return;
      }

      switch (actionId) {
        case "reload":
          refreshTab(props.group, tabContext.value);
          break;
        case "close":
          removeTab(props.group, tabContext.value);
          break;
        case "closeAll":
          removeAll(props.group);
          break;
        case "closeOthers":
          removeOthers(props.group, tabContext.value);
          break;
        case "closeAbove":
          removeLeft(props.group, tabContext.value);
          break;
        case "closeBelow":
          removeRight(props.group, tabContext.value);
          break;
      }
    }

    return {
      actions,
      contextMenu,
      onMenuClick,
      showContextMenu,
    };
  },
});
</script>

<template>
<nav
  class="vp-flex vp-flex-col vp-overflow-hidden hover:vp-overflow-x-hidden hover:vp-overflow-y-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-w-fit vp-pills vp-nav"
>
  <tab
    v-for="tab in tabs"
    :key="tab.id"
    :tab-id="tab.id"
    :active="tab.active"
    :closable="tab.closable"
    :group="group"
    :rounded="rounded"
    direction="none"
    @contextmenu.prevent="showContextMenu($event, tab.id)"
  >
    <span v-if="typeof tab.title === 'string'">
      {{ tab.title }}
    </span>
    <component :is="tab.title" v-else />
  </tab>

  <context-menu ref="contextMenu" boundingView=".vp-nav">
    <ul class="vp-bg-white vp-list-none vp-m-0 vp-px-0 vp-py-2 vp-shadow-md vp-rounded vp-text-left" role="menu">
      <li
        class="vp-cursor-pointer vp-py-[.375rem] vp-px-4 vp-whitespace-nowrap vp-text-gray-600 vp-text-sm hover:vp-bg-gray-100 hover:vp-text-gray-800 vp-transition-colors"
        v-for="action in actions"
        :key="action.id"
        @click="onMenuClick(action.id)"
        >
        {{ action.text }}
      </li>
    </ul>
  </context-menu>
</nav>
</template>