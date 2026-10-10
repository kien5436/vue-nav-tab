<script lang="ts">
import { Ref, defineComponent, ref, watch, watchEffect } from 'vue';

import { Tab, useCurrentTab } from '../hooks/use-operations';

export default defineComponent({
  name: 'TabView',
  props: {
    group: {
      required: true,
      type: String,
    },
  },
  setup(props) {

    const currentTab = useCurrentTab(props.group);
    const viewsContainIframe: Ref<Tab[]> = ref([]);

    watchEffect(() => {

      if (currentTab.value.hasIframe) {

        viewsContainIframe.value = viewsContainIframe.value.filter((tab) => !tab._key?.startsWith(currentTab.value.id + '~'));
        viewsContainIframe.value.push(currentTab.value);
      }
    });

    return {
      currentTab,
      viewsContainIframe,
    };
  },
});
</script>

<template>
  <div role="tabpanel" class="vp-box-border">
    <keep-alive>
      <component v-if="!currentTab.hasIframe" :is="currentTab.view" :key="currentTab._key"
        v-bind="currentTab.viewProps" />
    </keep-alive>

    <div v-for="tab in viewsContainIframe" :key="tab._key" v-show="currentTab._key === tab._key">
      <component :is="tab.view" v-bind="tab.viewProps" />
    </div>
  </div>
</template>
