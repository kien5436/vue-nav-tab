<script lang="ts">
import { ComputedRef, computed, defineComponent, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";

import { debounce } from "../utils/debounce";

export default defineComponent({
  name: "ContextMenu",
  props: {
    boundingView: {
      default: null,
      type: String,
    },
  },
  setup(props) {
    const isOpen = ref(false);
    const el = ref<HTMLElement | null>(null);
    const coord = reactive({
      left: 0,
      top: 0,
    });
    const boundingEl = computed(() =>
      (props.boundingView
        ? el.value?.closest(props.boundingView)
        : document.documentElement)
    ) as ComputedRef<HTMLElement>;
    const style = computed(() => ({
      display: isOpen.value ? "block" : "none",
      left: coord.left + "px",
      top: coord.top + "px",
      zIndex: 10000,
    }));

    const debouncedClose = debounce(close, 100, true);

    onMounted(() => {
      document.addEventListener("keyup", onKeyUp, false);
      document.addEventListener("click", close, false);
      document.addEventListener("scroll", debouncedClose, false);
      boundingEl.value.addEventListener("scroll", debouncedClose, false);
      window.addEventListener("resize", debouncedClose, false);
    });

    onUnmounted(() => {
      document.removeEventListener("keyup", onKeyUp, false);
      document.removeEventListener("click", close, false);
      document.removeEventListener("scroll", debouncedClose, false);
      boundingEl.value.removeEventListener("scroll", debouncedClose, false);
      window.removeEventListener("resize", debouncedClose, false);
    });

    function open(e: MouseEvent) {

      if (!el.value) return;

      el.value.style.setProperty("display", "");

      const { height, width } = el.value.getBoundingClientRect();
      coord.left = width + e.clientX + 20 > document.documentElement.clientWidth ? e.clientX - width : e.clientX;
      coord.top = height + e.clientY + 20 > document.documentElement.clientHeight ? e.clientY - height : e.clientY;

      nextTick(() => el.value?.focus());
      isOpen.value = true;
    }

    function close() {
      isOpen.value = false;
    }

    function onKeyUp(e: KeyboardEvent) {
      if ("Escape" === e.code) close();
    }

    return {
      close,
      el,
      open,
      style,
    };
  },
});
</script>

<template>
<div ref="el" class="vp-fixed vp-outline-none vp-font-sans vp-select-none" tabindex="-1" :style="style">
  <slot />
</div>
</template>