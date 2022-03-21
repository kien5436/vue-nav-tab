<script lang="ts">
import { defineComponent } from "vue";

import { useCurrentTab } from "../hooks/use-operations";

export default defineComponent({
  name: "TabView",
  props: {
    group: {
      required: true,
      type: String,
    },
  },
  setup(props) {

    const currentTab = useCurrentTab(props.group);

    return { currentTab };
  },
});
</script>

<template>
  <div role="tabpanel" class="vp-box-border">
    <keep-alive>
      <component
        :is="currentTab.view"
        :key="currentTab._key"
        v-bind="currentTab.viewProps"
      />
    </keep-alive>
  </div>
</template>