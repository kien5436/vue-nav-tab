# vue-nav-tab
Tab component for Vue.js project

## Build status
![Build status](https://img.shields.io/badge/build-passing-success?style=flat-square)

## Features
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

import App from './App.vue'

createApp(App)
.use(VueNavTab)
.mount('#app')
```

```html
// Component.vue
<template>
  <HNav appearance="tabs">
    <Tab
      :tabId="newtab"
      :closable="false"
      :active="true"
      group="group"
      :title="New tab"
    >
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
The MIT License

Copyright (c) [Phạm Trung Kiên]()

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.