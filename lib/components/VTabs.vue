<script lang="ts">
import { PropType, defineComponent } from "vue";

import ContextMenu from "./ContextMenu.vue";
import ContextMenuList from "./ContextMenuList.vue";
import { Tab as ITab } from "../hooks/use-operations";
import Tab from "./Tab.vue";
import YScrollbar from "./YScrollbar.vue";
import { useContextMenu } from "../hooks/use-contextmenu";
import useDragDrop from "../hooks/use-drag-n-drop";

export default defineComponent({
  name: "VTabs",
  components: {
    ContextMenu,
    ContextMenuList,
    Tab,
    YScrollbar,
  },
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
      type: Array as PropType<ITab[]>,
    },
  },
  setup(props) {

    const { actions, contextMenu, onMenuClick, showContextMenu } = useContextMenu(props.group, "vertical");
    const { dragOver, dragStart, drop } = useDragDrop(props.group);

    return {
      actions,
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
<y-scrollbar>
  <nav
    class="vp-flex vp-flex-col vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-pills vp-select-none vp-relative vp-nav"
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
      :style="{ top: `${2.5 * i}rem` }"
      direction="none"
      class="vp-left-0 vp-w-full"
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
</y-scrollbar>
</template>