<script lang="ts">
import { defineComponent } from "vue";
import { refreshTab } from "../../lib/operations";

export default defineComponent({
  setup() {

    function refreshThisTab() {
      refreshTab("base", "home");
    }

    return { refreshThisTab };
  },
});
</script>


<template>
  <h1>home page</h1>
  <button type="button" @click="refreshThisTab">refresh this tab</button>
  <input type="checkbox" />
</template>