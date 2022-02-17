import { babel, getBabelOutputPlugin } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import banner from "rollup-plugin-banner";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import jsx from "acorn-jsx";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import vue from "rollup-plugin-vue";

const pkg = require("./package.json");

/** @type import("rollup").OutputOptions */
const outputOptions = {
  exports: "named",
  globals: { vue: "Vue" },
};

/** @type import("rollup").RollupOptions */
const config = {
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
        terser(),
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
        terser(),
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
      tsconfigOverride: {
        include: ["lib/**/*.ts", "lib/**/*.vue"],
      },
      useTsconfigDeclarationDir: true,
    }),
    vue(),
    banner(`<%= pkg.name %> v<%= pkg.version %>
    by <%= pkg.author %>
    <%= pkg.repository.url %>`),
    babel({ babelHelpers: "bundled" }),
    copy({
      targets: [{ src: ["lib/fonts/*", "!**/*.json"], dest: "dist/fonts" }],
    }),
  ],
  acornInjectPlugins: [jsx()],
  external: ["vue"],
};

export default config;
