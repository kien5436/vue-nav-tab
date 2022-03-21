<script lang="ts">
import { PropType, computed, defineComponent } from "vue";

import ContextMenu from "./ContextMenu.vue";
import { Tab as ITab } from "../hooks/use-operations";
import Tab from "./Tab.vue";
import { useContextMenu } from "../hooks/use-contextmenu";
import useDragDrop from "../hooks/use-drag-n-drop";

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
    const { actions, contextMenu, onMenuClick, showContextMenu } = useContextMenu(props.group, "horizontal");
    const { dragOver, dragStart, drop } = useDragDrop(props.group);

    return {
      actions,
      classes,
      contextMenu,
      dragOver,
      dragStart,
      drop,
      onMenuClick,
      showContextMenu,
    };
  },
});
</script>

<template>
<nav
  class="vp-flex vp-flex-nowrap vp-overflow-hidden hover:vp-overflow-x-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-select-none vp-relative vp-h-10 vp-nav"
  :class="classes"
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