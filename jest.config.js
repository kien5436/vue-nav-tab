/** @type jest.ConfigGlobals */
module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  testMatch: ["**/components/**/*.spec.[jt]s?(x)"],
  transform: { "^.+\\.vue$": "vue-jest" },
};