<script lang="ts">
import { PropType, computed, defineComponent } from "vue";

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

    return {
      actions,
      contextMenu,
      dragOver,
      dragStart,
      drop,
      navClass,
      onMenuClick,
      scrollbarClass,
      showContextMenu,
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
      :key="tab.id"
      :tab-id="tab.id"
      :active="tab.active"
      :closable="tab.closable"
      :title="tab.hoverTitle"
      :group="group"
      :rounded="rounded"
      :direction="position"
      :style="{ left: `${7.5 * i}rem` }"
      class="vp-w-[7.5rem] vp-top-0"
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