/* eslint-disable sort-keys */
/** @type import('eslint').Linter.Config */
module.exports = {
  root: true,
  env: { node: true },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "pk/eslint-browser",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: "@typescript-eslint/parser",
  },
  rules: {
    "no-console": "prod" === process.env.NODE_ENV ? "warn" : "off",
    "no-debugger": "prod" === process.env.NODE_ENV ? "warn" : "off",
    quotes: ["error", "double"],
    "sort-imports": ["error", {
      "ignoreCase": false,
      "ignoreDeclarationSort": false,
      "ignoreMemberSort": false,
      "memberSyntaxSortOrder": ["none", "multiple", "all", "single"],
      "allowSeparatedGroups": true,
    }],
    "vue/multi-word-component-names": "off",
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: { jest: true },
    },
  ],
  ignorePatterns: ["dist/*", "types/*", "node_modules/*"],
};