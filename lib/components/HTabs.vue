<script lang="ts">
import { PropType, computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

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
    const scrollWrapperClass = computed(() => ({
      "before:vp-bottom-px": "tabs" === props.appearance && "bottom" === props.position,
      "before:vp-content-[''] before:vp-block before:vp-absolute before:vp-left-0 before:vp-w-full before:vp-h-px before:vp-bg-gray-300": "tabs" === props.appearance,
      "before:vp-top-px": "tabs" === props.appearance && "top" === props.position,
    }));
    const scrollbarClass = computed(() => ({
      "vp-bottom-0": "bottom" === props.position,
      "vp-top-0": "top" === props.position,
    }));

    const navWrapper = ref<HTMLElement | null>(null);
    const scrollWrapper = ref<HTMLElement | null>(null);
    const track = ref<HTMLElement | null>(null);
    const thumb = ref<HTMLElement | null>(null);

    const scrollRatio = ref(1);
    const showScrollbar = ref(false);
    const movingScrollbar = ref(false);
    const thumbStyle = computed(() => (!showScrollbar.value || 1 === scrollRatio.value ? null : { width: `${scrollRatio.value * 100}%` }));
    const navWrapperScrollPos = reactive({
      left: 0,
      x: 0,
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

      navWrapperScrollPos.left = navWrapper.value ? navWrapper.value.scrollLeft : 0;
      navWrapperScrollPos.x = e.clientX;
      document.body.style.setProperty("user-select", "none");

      document.addEventListener("mousemove", moveThumb, false);
      document.addEventListener("mouseup", stopGrabThumb, false);
    }

    function moveThumb(e: MouseEvent) {

      if (navWrapper.value) {

        movingScrollbar.value = true;
        navWrapper.value.scrollLeft = (e.clientX - navWrapperScrollPos.x) / scrollRatio.value + navWrapperScrollPos.left;
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

          thumb.value.style.setProperty("left", `${navWrapper.value.scrollLeft / navWrapper.value.scrollWidth * 100}%`);
        }
      });
    }

    function onClickTrack(e: MouseEvent) {

      if (!track.value || !navWrapper.value) return;

      const trackRect = track.value.getBoundingClientRect();
      const percentage = (e.clientX - trackRect.left) / trackRect.width;
      navWrapper.value.scrollLeft = percentage * (navWrapper.value.scrollWidth - navWrapper.value.clientWidth);
    }

    function trackUserMovement(e: MouseEvent) {

      if (!navWrapper.value) return;

      scrollRatio.value = navWrapper.value.clientWidth / navWrapper.value.scrollWidth;
      showScrollbar.value = "mouseenter" === e.type && 1 > scrollRatio.value;
      thumb.value?.style.setProperty("left", `${navWrapper.value.scrollLeft / navWrapper.value.scrollWidth * 100}%`);
    }

    return {
      actions,
      contextMenu,
      dragOver,
      dragStart,
      drop,
      navClass,
      navWrapper,
      onMenuClick,
      scrollWrapper,
      scrollWrapperClass,
      scrollbarClass,
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
  class="vp-overflow-hidden vp-h-10 vp-relative"
  :class="scrollWrapperClass">
  <div
      ref="navWrapper"
      class="vp-h-full vp-overflow-x-auto vp-overflow-y-hidden -vp-mb-4 vp-pb-4 vp-box-content">
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

  <div v-show="showScrollbar" class="vp-absolute vp-h-1.5 vp-left-0 vp-w-full" :class="scrollbarClass">
    <div ref="track" class="vp-absolute vp-top-0 vp-left-0 vp-w-full vp-h-full vp-bg-slate-400/30 vp-rounded"></div>
    <div ref="thumb" class="vp-absolute vp-top-0 vp-h-full vp-bg-zinc-400 vp-rounded" :style="thumbStyle"></div>
  </div>
</div>
</template>