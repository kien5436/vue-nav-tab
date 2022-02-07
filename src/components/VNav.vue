<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VNav",
});
</script>

<template>
  <nav
    class="vp-flex vp-flex-col hover:vp-overflow-x-hidden hover:vp-overflow-y-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent vp-w-fit vp-pills"
  >
    <slot />
  </nav>
</template>
