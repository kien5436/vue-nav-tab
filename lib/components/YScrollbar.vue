<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";

export default defineComponent({
  name: "YScrollbar",
  setup() {

    const navWrapper = ref<HTMLElement | null>(null);
    const track = ref<HTMLElement | null>(null);
    const thumb = ref<HTMLElement | null>(null);

    const scrollRatio = ref(1);
    const showScrollbar = ref(false);
    const thumbStyle = computed(() => (!showScrollbar.value || 1 === scrollRatio.value ? null : { height: `${scrollRatio.value * 100}%` }));
    const navWrapperScrollPos = reactive({
      top: 0,
      y: 0,
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

        navWrapper.value.scrollTop = (e.clientY - navWrapperScrollPos.y) / scrollRatio.value + navWrapperScrollPos.top;
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
<div
  class="vp-overflow-hidden vp-h-10 vp-relative"
  @mouseenter="trackUserMovement"
  @mouseleave="trackUserMovement"
>
  <div
    ref="navWrapper"
    class="vp-h-full vp-overflow-y-auto vp-overflow-x-hidden -vp-mr-4 vp-pr-4 vp-box-border"
    @scroll="scrollThumb">
    <slot />
  </div>

  <div
    v-show="showScrollbar"
    class="vp-absolute vp-h-full vp-top-0 vp-right-0 vp-w-1.5">
    <div
      ref="track"
      class="vp-absolute vp-top-0 vp-left-0 vp-w-full vp-h-full vp-bg-slate-400/30 vp-rounded"
      @click="onClickTrack"></div>
    <div
      ref="thumb"
      class="vp-absolute vp-left-0 vp-w-full vp-bg-zinc-400 vp-rounded"
      :style="thumbStyle"
      @mousedown="startGrabThumb"></div>
  </div>
</div>
</template>