<script lang="ts">
import { PropType, computed, defineComponent, ref } from "vue";

import { Tab as ITab, refreshTab, removeAll, removeLeft, removeOthers, removeRight, removeTab } from "../operations";
import ContextMenu from "./ContextMenu.vue";
import Tab from "./Tab.vue";

export default defineComponent({
  name: "HTabs",
  components: {
    ContextMenu,
    Tab,
  },
  props: {
    appearance: {
      default: "tabs",
      type: String,
      validator: (val: string) => ["tabs", "pills"].includes(val),
    },
    group: {
      required: true,
      type: String,
    },
    position: {
      default: "top",
      type: String,
      validator: (val: string) => ["top", "bottom"].includes(val),
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    tabs: {
      required: true,
      type: Array as PropType<ITab[]>,
    },
  },
  setup(props) {
    const classes = computed(() => ({
      "vp-border-b-gray-300 vp-border-b": "tabs" === props.appearance && "top" === props.position,
      "vp-border-t-gray-300 vp-border-t": "tabs" === props.appearance && "bottom" === props.position,
      "vp-pills": "pills" === props.appearance,
      "vp-tabs vp-border-solid": "tabs" === props.appearance,
      "vp-tabs-bottom": "bottom" === props.position,
    }));
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
        id: "closeLeft",
        text: "Close to the left",
      },
      {
        id: "closeRight",
        text: "Close to the right",
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
        case "closeLeft":
          removeLeft(props.group, tabContext.value);
          break;
        case "closeRight":
          removeRight(props.group, tabContext.value);
          break;
      }
    }

    return {
      actions,
      classes,
      contextMenu,
      onMenuClick,
      showContextMenu,
    };
  },
});
</script>

<template>
<nav
  class="vp-flex vp-flex-nowrap vp-overflow-hidden hover:vp-overflow-x-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-nav"
  :class="classes"
>
  <tab
    v-for="tab in tabs"
    :key="tab.id"
    :tab-id="tab.id"
    :active="tab.active"
    :closable="tab.closable"
    :group="group"
    :rounded="rounded"
    :direction="position"
    @contextmenu.prevent="showContextMenu($event, tab.id)"
  >
    <span v-if="typeof tab.title === 'string'">
      {{ tab.title }}
    </span>
    <component :is="tab.title" v-bind="tab.titleProps" v-else />
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