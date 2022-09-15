<script lang="ts">
import { defineComponent, ref, watch } from "vue";

import { Tab, useCurrentTab } from "../hooks/use-operations";

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
    const iframes = ref<Tab[]>([]);

    watch(currentTab, (newVal) => {

      if (newVal.hasIframe && !iframes.value.some((tab) => tab._key === newVal._key)) {

        iframes.value = iframes.value.filter((tab) => !tab._key?.startsWith(newVal.id + "~"));
        iframes.value.push(newVal);
      }
    }, { immediate: true });

    return {
      currentTab,
      iframes,
    };
  },
});
</script>

<template>
  <div role="tabpanel" class="vp-box-border">
    <keep-alive>
      <component
        v-if="!currentTab.hasIframe"
        :is="currentTab.view"
        :key="currentTab._key"
        v-bind="currentTab.viewProps"
      />
    </keep-alive>

    <div
      v-for="tab in iframes"
      :key="tab._key"
      v-show="currentTab._key === tab._key"
    >
      <component
        :is="tab.view"
        v-bind="tab.viewProps"
      />
    </div>
  </div>
</template>