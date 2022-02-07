<script lang="ts">
import { computed, defineComponent } from "vue";

import { addTab, useCurrentTab, useTabs } from "../operations";
import BlankTabView from "./BlankTabView.vue";

export default defineComponent({
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
    tabId: String,
    rounded: {
      default: false,
      type: Boolean,
    },
  },
  setup(props) {
    const classes = computed(() => ({
      "vp-item-active": props.active,
      "vp-pr-8 vp-justify-start": props.closable,
      "vp-pr-4 vp-justify-center": !props.closable,
      "vp-rounded-t": props.rounded,
      "vp-text-gray-100 !vp-text-gray-500 !vp-bg-gray-100 vp-pointer-events-none":
        "_" === props.tabId,
    }));
    const computedTabId = computed(() => `${props.tabId}-tab`);
    const tabs = useTabs(props.group);
    const currentTab = useCurrentTab(props.group);

    function activateTab() {
      if (props.active) return;

      const idx = tabs.findIndex((tab) => tab.id === props.tabId);
      const currentTabIdx = tabs.findIndex(
        (tab) => tab.id === currentTab.value.id
      );

      tabs.splice(currentTabIdx, 1, { ...currentTab.value, active: false });
      tabs.splice(idx, 1, { ...tabs[idx], active: true });
    }

    function removeTab() {
      const idx = tabs.findIndex((tab) => tab.id === props.tabId);
      const currentTabIdx = tabs.findIndex(
        (tab) => tab.id === currentTab.value.id
      );

      if (tabs.length === 1) {
        addBlankTab();
      }

      if (idx !== currentTabIdx) {
        tabs.splice(idx, 1);
        return;
      }

      if (currentTab.value.active) {
        const prevTabIdx = currentTabIdx - 1;
        const nextTabIdx = currentTabIdx + 1;

        if (0 > prevTabIdx) {
          tabs.splice(nextTabIdx, 1, { ...tabs[nextTabIdx], active: true });
        } else {
          tabs.splice(prevTabIdx, 1, { ...tabs[prevTabIdx], active: true });
        }
      }

      tabs.splice(currentTabIdx, 1);
    }

    function addBlankTab() {
      addTab(props.group, {
        id: "_",
        title: "Blank",
        view: BlankTabView,
      });
    }

    return {
      activateTab,
      classes,
      computedTabId,
      removeTab,
    };
  },
});
</script>

<template>
  <a
    class="vp-flex vp-text-gray-600 vp-items-center vp-no-underline vp-h-10 vp-box-border vp-transition vp-min-w-[7.5rem] vp-py-2 vp-pl-4 vp-max-w-xs vp-relative vp-item"
    :class="classes"
    :id="computedTabId"
    href="#"
    @click.prevent="activateTab"
  >
    <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border">
      <slot />
    </div>
    <span
      v-if="closable"
      class="vp-absolute vp-top-1.5 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"
      @click.stop.prevent="removeTab"
    >
      <i class="vp-icon vp-icon-x"></i>
    </span>
  </a>
</template>
