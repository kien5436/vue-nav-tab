<script lang="ts">
import { PropType, computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import ContextMenu from "./ContextMenu.vue";
import { Tab as ITab } from "../hooks/use-operations";
import Tab from "./Tab.vue";
import { useContextMenu } from "../hooks/use-contextmenu";
import useDragDrop from "../hooks/use-drag-n-drop";

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
    const { dragOver, dragStart, drop } = useDragDrop(props.group);

    const navWrapper = ref<HTMLElement | null>(null);
    const scrollWrapper = ref<HTMLElement | null>(null);
    const track = ref<HTMLElement | null>(null);
    const thumb = ref<HTMLElement | null>(null);

    const scrollRatio = ref(1);
    const showScrollbar = ref(false);
    const movingScrollbar = ref(false);
    const thumbStyle = computed(() => (!showScrollbar.value || 1 === scrollRatio.value ? null : { height: `${scrollRatio.value * 100}%` }));
    const navWrapperScrollPos = reactive({
      top: 0,
      y: 0,
    });

    onMounted(() => {

      thumb.value?.addEventListener("mousedown", startGrabThumb, false);
      navWrapper.value?.addEventListener("scroll", scrollThumb, false);
      scrollWrapper.value?.addEventListener("mouseenter", trackUserMovement, false);
      scrollWrapper.value?.addEventListener("mouseleave", trackUserMovement, false);
      track.value?.addEventListener("click", onClickTrack, false);
    });

    onBeforeUnmount(() => {

      thumb.value?.removeEventListener("mousedown", startGrabThumb, false);
      navWrapper.value?.removeEventListener("scroll", scrollThumb, false);
      scrollWrapper.value?.removeEventListener("mouseenter", trackUserMovement, false);
      scrollWrapper.value?.removeEventListener("mouseleave", trackUserMovement, false);
      track.value?.removeEventListener("click", onClickTrack, false);
    });

    function startGrabThumb(e: MouseEvent) {

      navWrapperScrollPos.top = navWrapper.value ? navWrapper.value.scrollTop : 0;
      navWrapperScrollPos.y = e.clientY;
      document.body.style.setProperty("user-select", "none");

      document.addEventListener("mousemove", moveThumb, false);
      document.addEventListener("mouseup", stopGrabThumb, false);
    }

    function moveThumb(e: MouseEvent) {

      if (navWrapper.value) {

        movingScrollbar.value = true;
        navWrapper.value.scrollTop = (e.clientY - navWrapperScrollPos.y) / scrollRatio.value + navWrapperScrollPos.top;
      }
    }

    function stopGrabThumb() {

      movingScrollbar.value = false;
      document.body.style.removeProperty("user-select");
      document.removeEventListener("mousemove", moveThumb, false);
      document.removeEventListener("mouseup", stopGrabThumb, false);
    }

    function scrollThumb() {

      window.requestAnimationFrame(() => {

        if (navWrapper.value && thumb.value) {

          thumb.value.style.setProperty("top", `${navWrapper.value.scrollTop / navWrapper.value.scrollHeight * 100}%`);
        }
      });
    }

    function onClickTrack(e: MouseEvent) {

      if (!track.value || !navWrapper.value) return;

      const trackRect = track.value.getBoundingClientRect();
      const percentage = (e.clientY - trackRect.top) / trackRect.height;
      navWrapper.value.scrollTop = percentage * (navWrapper.value.scrollHeight - navWrapper.value.clientHeight);
    }

    function trackUserMovement(e: MouseEvent) {

      if (!navWrapper.value) return;

      scrollRatio.value = navWrapper.value.clientHeight / navWrapper.value.scrollHeight;
      showScrollbar.value = "mouseenter" === e.type && 1 > scrollRatio.value;
      thumb.value?.style.setProperty("top", `${navWrapper.value.scrollTop / navWrapper.value.scrollHeight * 100}%`);
    }

    return {
      actions,
      contextMenu,
      dragOver,
      dragStart,
      drop,
      navWrapper,
      onMenuClick,
      scrollWrapper,
      showContextMenu,
      showScrollbar,
      thumb,
      thumbStyle,
      track,
    };
  },
});
</script>

<template>
<div
  ref="scrollWrapper"
  class="vp-overflow-hidden vp-relative">
  <div
      ref="navWrapper"
      class="vp-h-full vp-overflow-y-auto vp-overflow-x-hidden -vp-mr-4 vp-pr-4 vp-box-border">
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
  </div>

  <div v-show="showScrollbar" class="vp-absolute vp-h-full vp-top-0 vp-right-0 vp-w-1.5">
    <div ref="track" class="vp-absolute vp-top-0 vp-left-0 vp-w-full vp-h-full vp-bg-slate-400/30 vp-rounded"></div>
    <div ref="thumb" class="vp-absolute vp-left-0 vp-w-full vp-bg-zinc-400 vp-rounded" :style="thumbStyle"></div>
  </div>
</div>
</template>