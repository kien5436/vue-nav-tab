<script lang="ts">
import { defineComponent, onDeactivated, onUnmounted, ref } from "vue";

export default defineComponent({
  setup() {
    const count = ref(0);

    onDeactivated(() => {

      console.debug("Profile.vue:10: onDeactivated");
    });

    onUnmounted(() => {

      console.debug("Profile.vue:15: onUnmounted");

    });

    return { count };
  },
});
</script>


<template>
  <h1>profile page</h1>
  <p>You visited this tab <span style="color:#f00">{{count}}</span> times</p>
  <button type="button" @click="count++">increase</button>
</template>