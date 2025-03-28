<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";

export default defineComponent({
  name: "XScrollbar",
  setup() {

    const navWrapper = ref<HTMLElement | null>(null);
    const track = ref<HTMLElement | null>(null);
    const thumb = ref<HTMLElement | null>(null);

    const scrollRatio = ref(1);
    const showScrollbar = ref(false);
    const thumbStyle = computed(() => (!showScrollbar.value || 1 === scrollRatio.value ? null : { width: `${scrollRatio.value * 100}%` }));
    const navWrapperScrollPos = reactive({
      left: 0,
      x: 0,
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

        navWrapper.value.scrollLeft = (e.clientX - navWrapperScrollPos.x) / scrollRatio.value + navWrapperScrollPos.left;
      }
    }

    function stopGrabThumb() {

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
      navWrapper,
      onClickTrack,
      scrollThumb,
      showScrollbar,
      startGrabThumb,
      thumb,
      thumbStyle,
      track,
      trackUserMovement,
    };
  },
});
</script>

<template>
  <div class="vp-overflow-hidden vp-h-10 vp-relative" @mouseenter="trackUserMovement" @mouseleave="trackUserMovement">
    <div ref="navWrapper"
      class="vp-h-full vp-overflow-x-auto vp-overflow-y-hidden -vp-mb-4 vp-pb-4 vp-box-content vp-scroller"
      @scroll="scrollThumb">
      <slot />
    </div>

    <div v-show="showScrollbar" class="vp-absolute vp-h-1.5 vp-left-0 vp-w-full vp-bottom-0">
      <div ref="track" class="vp-absolute vp-top-0 vp-left-0 vp-w-full vp-h-full vp-bg-slate-400/30 vp-rounded"
        @click="onClickTrack"></div>
      <div ref="thumb" class="vp-absolute vp-top-0 vp-h-full vp-bg-zinc-400 vp-rounded" :style="thumbStyle"
        @mousedown="startGrabThumb"></div>
    </div>
  </div>
</template>