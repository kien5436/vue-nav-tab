import { App, Plugin } from 'vue';

import './style.css';
import { ContextMenuLocale, key, mergeWithDefaultLocales } from './hooks/use-contextmenu';
import HTabs from './components/HTabs.vue';
import TabView from './components/TabView.vue';
import VTabs from './components/VTabs.vue';

export default {
  install(app: App, options: ContextMenuLocale = {}): void {

    app.component('HTabs', HTabs);
    app.component('VTabs', VTabs);
    app.component('TabView', TabView);
    app.provide(key, mergeWithDefaultLocales(options));
  },
} as Plugin;

export * from './hooks/use-operations';

export {
  HTabs,
  TabView,
  VTabs,
};
