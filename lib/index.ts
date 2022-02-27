import { App } from "vue";

import "./style.css";
import HTabs from "./components/HTabs.vue";
import TabView from "./components/TabView.vue";
import VTabs from "./components/VTabs.vue";

export default {
  install(app: App): void {
    app.component(HTabs.name, HTabs);
    app.component(VTabs.name, VTabs);
    app.component(TabView.name, TabView);
  },
};

export * from "./operations";