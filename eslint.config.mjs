import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([".astro/**", "dist*/**"]),
  {
    files: ["**/*.{js,mjs}"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      eslintPluginReactHooks.configs.flat.recommended,
      eslintPluginTailwindcss.configs["recommended"],
    ],
    settings: {
      tailwindcss: { cssConfigPath: "src/styles/global.css" },
    },
    rules: {
      "tailwindcss/classnames-order": "off",
    },
  },
  {
    files: ["**/*.astro"],
    extends: [
      tseslint.configs.recommended,
      eslintPluginAstro.configs.recommended,
    ],
  },
]);
