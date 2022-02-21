<script lang="ts">
import { computed, defineComponent } from "vue";

import { removeTab, useCurrentTab, useTabs } from "../operations";

export default defineComponent({
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

    return {
      activateTab,
      classes,
      closeTab,
      computedTabId,
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
      @click.stop.prevent="closeTab"
    >
      <i class="vp-icon vp-icon-x"></i>
    </span>
  </a>
</template>