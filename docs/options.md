`vue-nav-tab` supports `i18n` so that you can make the tabs's context menu consistent with your site language. Just define your translation in the second parameter of `Vue.use()`.

```js
import { createApp } from 'vue';
import VueNavTab from 'vue-nav-tab';
...
const options = {
  en: { ... },
  vi: { ... },
  ...
};

createApp(App).use(VueNavTab, options).mount('#app');
```

Available options:

```ts
interface ContextMenuLocale {
  [key: string]: {
    close: string;
    closeAbove: string;
    closeAll: string;
    closeBelow: string;
    closeLeft: string;
    closeOthers: string;
    closeRight: string;
    reload: string;
  }
}
```

The options's `key`s accept [Standard HTML ISO Language Codes](https://www.w3schools.com/tags/ref_language_codes.asp). By default, this plugin provides translations for English and Vietnamese. When you change your site's language, the plugin determines which language to use by reading the lang attribute of the html tag. Since this is not an i18n plugin, make sure you update the lang attribute correctly. Otherwise, the context menu won't change languages and may fall back to English.
