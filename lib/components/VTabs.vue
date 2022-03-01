<script lang="ts">
import { PropType, defineComponent } from "vue";

import ContextMenu from "./ContextMenu.vue";
import { Tab as ITab } from "../operations";
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

    return {
      actions,
      contextMenu,
      onMenuClick,
      showContextMenu,
    };
  },
});
</script>

<template>
<nav
  class="vp-flex vp-flex-col vp-overflow-hidden hover:vp-overflow-x-hidden hover:vp-overflow-y-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-w-fit vp-pills vp-nav"
>
  <tab
    v-for="tab in tabs"
    :key="tab.id"
    :tab-id="tab.id"
    :active="tab.active"
    :closable="tab.closable"
    :group="group"
    :rounded="rounded"
    direction="none"
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