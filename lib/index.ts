import { App } from "vue";

import "./style.css";
import HNav from "./components/HNav.vue";
import Tab from "./components/Tab.vue";
import TabView from "./components/TabView.vue";
import VNav from "./components/VNav.vue";

export default {
  install(app: App): void {
    app.component(HNav.name, HNav);
    app.component(VNav.name, VNav);
    app.component(Tab.name, Tab);
    app.component(TabView.name, TabView);
  },
};

export * from "./operations";