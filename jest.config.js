/** @type jest.ConfigGlobals */
module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  testMatch: ["**/components/**/*.spec.[jt]s?(x)"],
};
