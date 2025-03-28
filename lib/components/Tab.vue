<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref } from "vue";

import { removeTab, useCurrentTab, useTabs } from "../hooks/use-operations";

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
    direction: {
      required: true,
      type: String,
      validator: (val: string) => ["top", "bottom", "none"].includes(val),
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
      "vp-rounded": props.rounded && "none" === props.direction,
      "vp-rounded-b": props.rounded && "top" === props.direction,
      "vp-rounded-t": props.rounded && "bottom" === props.direction,
      "vp-text-gray-100 !vp-text-gray-500 !vp-bg-gray-100 vp-pointer-events-none": "_" === props.tabId,
    }));
    const computedTabId = computed(() => `${props.tabId}-tab`);
    const tab = ref<HTMLElement | null>(null);

    onMounted(() => {
      nextTick(() => tab.value?.scrollIntoView());
    });

    function activateTab() {

      if (props.active) return;

      const idx = tabs.findIndex((_tab) => _tab.id === props.tabId);
      const currentTabIdx = tabs.findIndex((_tab) => _tab.id === currentTab.value.id);

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
      tab,
    };
  },
});
</script>

<template>
  <a ref="tab"
    class="vp-flex vp-text-gray-600 vp-items-center !vp-no-underline vp-h-10 vp-box-border vp-transition vp-pl-4 vp-absolute vp-cursor-pointer vp-font-sans vp-item"
    :class="classes" :id="computedTabId" draggable="true" @click="activateTab" role="tab">
    <div class="vp-truncate vp-text-clip vp-flex vp-items-center vp-box-border">
      <slot />
    </div>
    <span v-if="closable"
      class="vp-absolute vp-top-2 vp-right-1 vp-w-6 vp-h-6 hover:vp-bg-gray-200 vp-rounded-sm vp-inline-flex vp-items-center vp-justify-center vp-box-border"
      @click.stop.prevent="closeTab">
      <i class="vp-icon vp-icon-x"></i>
    </span>
  </a>
</template>