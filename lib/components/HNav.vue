<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "HNav",
  props: {
    appearance: {
      default: "tabs",
      type: String,
      validator: (val: string) => ["tabs", "pills"].includes(val),
    },
    position: {
      default: "top",
      type: String,
      validator: (val: string) => ["top", "bottom"].includes(val),
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

    return { classes };
  },
});
</script>

<template>
  <nav
    class="vp-flex vp-flex-nowrap vp-overflow-hidden hover:vp-overflow-x-auto vp-border-0 vp-m-0 vp-p-0 vp-box-border vp-bg-transparent"
    :class="classes"
  >
    <slot />
  </nav>
</template>