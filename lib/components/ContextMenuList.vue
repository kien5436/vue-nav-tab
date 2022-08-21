<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ContextMenuList",
  props: {
    actions: {
      required: true,
      type: Array,
    },
    onMenuClick: {
      required: true,
      type: Function,
    },
  },
});
</script>

<template>
<ul class="vp-bg-white vp-list-none vp-m-0 vp-px-0 vp-py-2 vp-shadow-md vp-rounded vp-text-left" role="menu">
  <li
    class="vp-py-[.375rem] vp-px-4 vp-whitespace-nowrap vp-text-gray-600 vp-text-sm vp-transition-colors"
    v-for="action in actions"
    :key="action.id"
    :class="{
      'vp-text-gray-400': action.disabled,
      'hover:vp-bg-gray-100 hover:vp-text-gray-800': !action.disabled,
    }"
    @click="onMenuClick(action.id)"
    >
    {{ action.text }}
  </li>
</ul>
</template>