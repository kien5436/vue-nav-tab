<script lang="ts">
import { PropType, defineComponent } from "vue";

import { Tab as ITab, useTabs } from "../operations";
import ContextMenu from "./ContextMenu.vue";
import Tab from "./Tab.vue";
import { useContextMenu } from "../use-contextmenu";

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
      type: Array as PropType<ITab[]>,
    },
  },
  setup(props) {

    const { actions, contextMenu, onMenuClick, showContextMenu } = useContextMenu(props.group, "vertical");
    const tabs = useTabs(props.group);

    function dragStart(e: DragEvent) {

      let id = (e.target as HTMLElement).id;
      id = id.slice(0, id.lastIndexOf("-tab"));

      e.dataTransfer?.setData("text/vnt-group", props.group);
      e.dataTransfer?.setData("text/plain", id);
    }

    function dragOver(e: DragEvent) {

      if (props.group !== e.dataTransfer?.getData("text/vnt-group")) return;

      e.preventDefault();

      const draggedItemId = e.dataTransfer?.getData("text/plain");
      const draggedIdx = tabs.findIndex((tab) => tab.id === draggedItemId);
      const targetItem = (e.target as HTMLElement).closest(".vp-item");
      const targetId = targetItem?.id.slice(0, targetItem.id.lastIndexOf("-tab"));
      const targetIdx = tabs.findIndex((tab) => tab.id === targetId);

      if (draggedIdx !== targetIdx) {

        [tabs[draggedIdx], tabs[targetIdx]] = [tabs[targetIdx], tabs[draggedIdx]];
        tabs.splice(0, 0);
      }
    }

    function drop(e: DragEvent) {

      e.preventDefault();

      if (props.group !== e.dataTransfer?.getData("text/vnt-group")) return;

      const draggedItemId = e.dataTransfer?.getData("text/plain");
      const draggedIdx = tabs.findIndex((tab) => tab.id === draggedItemId);
      const targetItem = (e.target as HTMLElement).closest(".vp-item");
      const targetId = targetItem?.id.slice(0, targetItem.id.lastIndexOf("-tab"));
      const targetIdx = tabs.findIndex((tab) => tab.id === targetId);

      if (draggedIdx !== targetIdx) {

        [tabs[draggedIdx], tabs[targetIdx]] = [tabs[targetIdx], tabs[draggedIdx]];
        tabs.splice(0, 0);
      }
    }

    return {
      actions,
      contextMenu,
      onMenuClick,
      showContextMenu,
      dragStart,
      dragOver,
      drop,
    };
  },
});
</script>

<template>
<nav
  class="vp-flex vp-flex-col vp-overflow-hidden hover:vp-overflow-x-hidden hover:vp-overflow-y-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-w-fit vp-pills vp-select-none vp-relative vp-nav"
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