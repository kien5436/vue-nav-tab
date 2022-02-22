import { babel, getBabelOutputPlugin } from "@rollup/plugin-babel";
import banner from "rollup-plugin-banner";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import vuePlugin from "rollup-plugin-vue";

const pkg = require("./package.json");

/** @type import("rollup").OutputOptions */
const outputOptions = {
  exports: "named",
  externalLiveBindings: false,
  globals: { vue: "Vue" },
};

/** @type import("rollup").RollupOptions */
const config = {
  external: ["vue"],
  input: "./lib/index.ts",
  output: [
    {
      ...outputOptions,
      file: pkg.main,
      format: "cjs",
    },
    {
      ...outputOptions,
      file: pkg.unpkg,
      format: "umd",
      name: "VueNavTab",
      plugins: [
        // getBabelOutputPlugin({
        //   configFile: "./babel.config.js",
        //   allowAllFormats: true,
        // }),
        terser({
          compress: {
            ecma: 2015,
            pure_getters: true,
          },
        }),
      ],
    },
    {
      ...outputOptions,
      file: pkg.module,
      format: "es",
      plugins: [
        // getBabelOutputPlugin({
        //   allowAllFormats: true,
        //   configFile: "./babel.config.js",
        // }),
        terser({
          compress: {
            ecma: 2015,
            pure_getters: true,
          },
        }),
      ],
    },
  ],
  plugins: [
    del({ targets: ["dist/*", "types/*"] }),
    postcss({
      config: { path: "./postcss.config.js" },
      extract: "vue-nav-tab.css",
      minimize: true,
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      tsconfigOverride: { include: ["lib/**/*.ts", "lib/**/*.vue"] },
      useTsconfigDeclarationDir: true,
    }),
    vuePlugin(),
    banner(`<%= pkg.name %> v<%= pkg.version %>
    @author <%= pkg.author %>
    @link <%= pkg.repository.url %>
    @license MIT`),
    // babel({ babelHelpers: "bundled" }),
    copy({ targets: [{ dest: "dist/fonts", src: ["lib/fonts/*", "!**/*.json"] }] }),
  ],
};

export default config;