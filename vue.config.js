const { defineConfig } = require('@vue/cli-service');

// `@vue/cli-plugin-eslint` still passes the removed `extensions` option to ESLint 9, so the
// vue-cli playground lints through `pnpm lint` only. Phase 3 replaces vue-cli with Vite.
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: false,
});
