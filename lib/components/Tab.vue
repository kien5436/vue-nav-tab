<script lang="ts">
import { computed, defineComponent, ref } from "vue";

import { refreshTab, removeAll, removeLeft, removeOthers, removeRight, removeTab, useCurrentTab, useTabs } from "../operations";
import ContextMenu from "./ContextMenu.vue";

export default defineComponent({
  components: { ContextMenu },
  emits: ["changed", "close"],
  name: "Tab",
  props: {
    active: {
      default: false,
      type: Boolean,
    },
    closable: {
      default: false,
      type: Boolean,
    },
    group: {
      required: true,
      type: String,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
    tabId: {
      required: true,
      type: String,
    },
  },
  setup(props) {

    const tabs = useTabs(props.group);
    const currentTab = useCurrentTab(props.group);
    const classes = computed(() => ({
      "vp-item-active": props.active,
      "vp-pr-4 vp-justify-center": !props.closable,
      "vp-pr-8 vp-justify-start": props.closable,
      "vp-rounded-t": props.rounded,
      "vp-text-gray-100 !vp-text-gray-500 !vp-bg-gray-100 vp-pointer-events-none": "_" === props.tabId,
    }));
    const computedTabId = computed(() => `${props.tabId}-tab`);
    const contextMenu = ref<InstanceType<typeof ContextMenu> | null>(null);
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

    function activateTab() {

      if (props.active) return;

      const idx = tabs.findIndex((tab) => tab.id === props.tabId);
      const currentTabIdx = tabs.findIndex((tab) => tab.id === currentTab.value.id);

      tabs.splice(currentTabIdx, 1, { ...currentTab.value, active: false });
      tabs.splice(idx, 1, { ...tabs[idx], active: true });
    }

    function closeTab() {

      removeTab(props.group, props.tabId);
    }

    function showContextMenu(e: MouseEvent) {

      contextMenu.value?.open(e);
    }

    function onMenuClick(actionId: string) {

      contextMenu.value?.close();

      switch (actionId) {
        case "reload":
          refreshTab(props.group, props.tabId);
          break;
        case "close":
          removeTab(props.group, props.tabId);
          break;
        case "closeAll":
          removeAll(props.group);
          break;
        case "closeOthers":
          removeOthers(props.group, props.tabId);
          break;
        case "closeLeft":
          removeLeft(props.group, props.tabId);
          break;
        case "closeRight":
          removeRight(props.group, props.tabId);
          break;
      }
    }

    return {
      actions,
      activateTab,
      classes,
      closeTab,
      computedTabId,
      contextMenu,
      onMenuClick,
      showContextMenu,
    };
  },
});
</script>

<template>
  <a
    class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-min-w-[7.5rem] vp-py-2 vp-pl-4 vp-max-w-xs vp-relative vp-item"
    :class="classes"
    :id="computedTabId"
    href="#"
    @click.prevent="activateTab"
    @contextmenu.prevent="showContextMenu"
  >
    <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border">
      <slot />
    </div>
    <span
      v-if="closable"
      class="vp-absolute vp-top-1.5 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"
      @click.stop.prevent="closeTab"
    >
      <i class="vp-icon vp-icon-x"></i>
    </span>

    <context-menu ref="contextMenu">
      <ul class="vp-bg-white vp-list-none vp-m-0 vp-px-0 vp-py-2 vp-shadow-md vp-rounded vp-text-left" role="menu">
        <li
          class="vp-cursor-pointer vp-py-[.375rem] vp-px-4 vp-whitespace-nowrap vp-text-gray-600 vp-text-sm hover:vp-bg-gray-100 hover:vp-text-gray-800 vp-transition-colors"
          v-for="action in actions"
          :key="action.id"
          @click.stop="onMenuClick(action.id)"
          >{{ action.text }}</li>
      </ul>
    </context-menu>
  </a>
</template>