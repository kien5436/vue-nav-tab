/** @type import('eslint').Linter.Config */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: "@typescript-eslint/parser",
  },
  rules: {
    "no-console": "prod" === process.env.NODE_ENV ? "warn" : "off",
    "no-debugger": "prod" === process.env.NODE_ENV ? "warn" : "off",
    "vue/multi-word-component-names": "off",
    "prettier/prettier": ["error", { endOfLine: "auto" }],
    yoda: ["error", "always"],
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
    },
  ],
  ignorePatterns: ["dist/*", "types/*", "node_modules/*"],
};
