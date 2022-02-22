# vue-nav-tab

Tab component for Vue.js project

## Build status

![Build status](https://img.shields.io/badge/build-passing-success?style=flat-square)

## Features

- [x] Use with vue 3 Composition API
- [x] Create horizontal or vertical tabs
- [ ] Open, close tabs programatically
- [x] Easily customizing tab and page view

## Installation

```sh
yarn add vue-nav-tab
# or
npm i vue-nav-tab
```

## Usage

- Browser

```html

```

- ES module

```js
// main.js

import { createApp } from 'vue';
import 'vue-nav-tab/dist/index.css';
import VueNavTab from 'vue-nav-tab';

import App from './App.vue';

createApp(App).use(VueNavTab).mount('#app');
```

```html
// Component.vue
<template>
  <HNav appearance="tabs">
    <Tab :tabId="newtab" :closable="false" :active="true" group="group" :title="New tab">
      New tab
    </Tab>
  </HNav>

  <TabView group="group" />
</template>
```

- SSR

```js
const VueNavTab = require('vue-nav-tab');
```

## License

MIT
