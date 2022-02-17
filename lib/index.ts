import { App } from "vue";

import "./style.css";
import HNav from "./components/HNav.vue";
import VNav from "./components/VNav.vue";
import Tab from "./components/Tab.vue";
import TabView from "./components/TabView.vue";

export default {
  install(app: App): void {
    app.component(HNav.name, HNav);
    app.component(VNav.name, VNav);
    app.component(Tab.name, Tab);
    app.component(TabView.name, TabView);
  },
};

export { createTabs, useCurrentTab, useTabs, addTab } from "./operations";
