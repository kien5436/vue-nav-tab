# vue-nav-tab

Tab components for Vue.js project

## Build status

![Build status](https://img.shields.io/badge/build-passing-success?style=flat-square)
[![npm](https://img.shields.io/npm/v/vue-nav-tab?style=flat-square)](https://www.npmjs.com/package/vue-nav-tab)

## Features

- [x] Built with Vue 3's Composition API
- [x] Zero dependency
- [x] Create horizontal or vertical tabs
- [x] Open, close or refresh tabs programatically
- [x] Drag'n'drop tabs
- [x] Easily customizing tabs and page view

## Installation

```sh
yarn add vue-nav-tab
# or
npm i vue-nav-tab
```

## Browser support

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 51+                                                                                                 | 54+                                                                                                    | 15+                                                                                         | 38+                                                                                              | 10+                                                                                                 |

## [Live demo](https://codesandbox.io/s/vue-nav-tab-2-example-vkl1uh)

## Usage

Please refer to [documentation](https://kien5436.github.io/vue-nav-tab/)

## Contribution

If you want to contribute for this project, feel free to create pull request but please follow the guide:

- Comply with [eslint](https://eslint.org/)
- Choose `dev` branch for developing and merging

To test this library locally:

```sh
# build
yarn build

# create portable module
yarn pack

# copy the vue-nav-tab-<version>.tgz file to the root of consumer project and add it as dependency
"dependencies": {
  "vue-nav-tab": "file:vue-nav-tab-<version>.tgz"
}

# install it
yarn
```

## License

[MIT](LICENSE)
