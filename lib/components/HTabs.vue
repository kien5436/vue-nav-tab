<script lang="ts">
import { Component, PropType, computed, defineComponent, nextTick, onBeforeUpdate, onMounted, ref, toRefs, watch } from "vue";

import ContextMenu from "./ContextMenu.vue";
import ContextMenuList from "./ContextMenuList.vue";
import { Tab as ITab } from "../hooks/use-operations";
import Tab from "./Tab.vue";
import XScrollbar from "./XScrollbar.vue";
import { useContextMenu } from "../hooks/use-contextmenu";
import useDragDrop from "../hooks/use-drag-n-drop";

export default defineComponent({
  name: "HTabs",
  components: {
    ContextMenu,
    ContextMenuList,
    Tab,
    XScrollbar,
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
      default: "bottom",
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

    const { actions, contextMenu, onMenuClick, showContextMenu } = useContextMenu(props.group, "horizontal");
    const { dragOver, dragStart, drop } = useDragDrop(props.group);

    const navClass = computed(() => ({
      "vp-pills": "pills" === props.appearance,
      "vp-tabs": "tabs" === props.appearance,
      "vp-tabs-bottom": "top" === props.position,
    }));
    const scrollbarClass = computed(() => ({
      "before:vp-bottom-px": "tabs" === props.appearance && "bottom" === props.position,
      "before:vp-content-[''] before:vp-block before:vp-absolute before:vp-left-0 before:vp-w-full before:vp-h-px before:vp-bg-gray-300": "tabs" === props.appearance,
      "before:vp-top-px": "tabs" === props.appearance && "top" === props.position,
    }));

    const { tabs } = toRefs(props);
    const tabRefs: InstanceType<typeof Tab>[] = [];

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    watch(tabs, async (_) => {

      await nextTick();

      for (let i = 0, l = tabRefs.length; i < l; i++) {

        let left = 0;
        const el: HTMLElement = tabRefs[i].$el;

        for (let j = i; 0 <= --j;) {

          const prevEl: HTMLElement = tabRefs[j].$el;
          left += prevEl.getBoundingClientRect().width;
        }

        el.style.setProperty("left", `${left}px`);
      }
    }, {
      deep: true,
      immediate: true,
    });

    onBeforeUpdate(() => (tabRefs.length = 0));

    function createTabRef(el: InstanceType<typeof Tab>, index: number) {

      if (el) tabRefs[index] = el;
    }

    return {
      actions,
      contextMenu,
      createTabRef,
      dragOver,
      dragStart,
      drop,
      navClass,
      onMenuClick,
      scrollbarClass,
      showContextMenu,
      tabRefs,
    };
  },
});
</script>

<template>
<x-scrollbar :class="scrollbarClass">
  <nav
    class="vp-flex vp-flex-nowrap vp-border-0 vp-m-0 vp-p-0 vp-h-10 vp-box-border vp-bg-transparent vp-select-none vp-relative vp-nav"
    :class="navClass"
    @dragstart="dragStart"
    @dragover="dragOver"
    @drop="drop"
  >
    <tab
      v-for="(tab, i) in tabs"
      :ref="el => createTabRef(el, i)"
      :key="tab.id"
      :tab-id="tab.id"
      :active="tab.active"
      :closable="tab.closable"
      :title="tab.hoverTitle"
      :group="group"
      :rounded="rounded"
      :direction="position"
      class="vp-top-0"
      @contextmenu.prevent="showContextMenu($event, tab.id)"
    >
      <span v-if="typeof tab.title === 'string'">
        {{ tab.title }}
      </span>
      <component :is="tab.title" v-bind="tab.titleProps" v-else />
    </tab>

    <context-menu ref="contextMenu" boundingView=".vp-nav">
      <context-menu-list :actions="actions" :onMenuClick="onMenuClick" />
    </context-menu>
  </nav>
</x-scrollbar>
</template>