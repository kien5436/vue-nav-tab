import { App, Plugin } from "vue";

import "./style.css";
import { ContextMenuLocale, key, mergeWithDefaultLocales } from "./hooks/use-contextmenu";
import HTabs from "./components/HTabs.vue";
import TabView from "./components/TabView.vue";
import VTabs from "./components/VTabs.vue";

export default {
  install(app: App, options: ContextMenuLocale = {}): void {

    app.component(HTabs.name, HTabs);
    app.component(VTabs.name, VTabs);
    app.component(TabView.name, TabView);
    app.provide(key, mergeWithDefaultLocales(options));
  },
} as Plugin;

export * from "./hooks/use-operations";