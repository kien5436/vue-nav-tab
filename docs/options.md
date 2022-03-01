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

```js
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

The options's `key`s accept [Standard HTML ISO Language Codes](https://www.w3schools.com/tags/ref_language_codes.asp). By default, this plugin provides translation for English and Vietnamese. When you change your site language, plugin will determine which language is used by reading `lang` attribute of `html` tag. Since it is not an i18n plugin, make sure you update the `lang` right, otherwise the context menu won't change or fallback to English.
