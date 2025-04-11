const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");
const eslintPluginPrettier = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**", ".env"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": "warning",
    },
  },
  prettier,
];
