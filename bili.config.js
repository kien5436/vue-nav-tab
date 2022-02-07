/** @type {import('bili').Config} */
module.exports = {
  input: "src/index.ts",
  output: {
    format: ["umd-min", "cjs-min", "esm-min"],
    moduleName: "VueNavTab",
  },
  plugins: {
    typescript2: true,
    vue: true,
  },
};
