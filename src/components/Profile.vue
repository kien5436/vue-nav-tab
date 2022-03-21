<script lang="ts">
import { defineComponent, ref } from "vue";

import { refreshTab } from "../../lib/hooks/use-operations";

export default defineComponent({
  name: "Profile",
  setup() {
    const count = ref(0);

    function refreshThisTab() {
      refreshTab("base", "profile");
    }

    return { count, refreshThisTab };
  },
});
</script>


<template>
  <h1>profile page</h1>
  <p>You visited this tab <span style="color:#f00">{{count}}</span> times</p>
  <button type="button" @click="count++">increase</button>
  <button type="button" @click="refreshThisTab">refresh this tab</button>
</template>