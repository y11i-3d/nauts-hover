// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const repository = pkg.repository || "";

const [userName, repoName] = repository.replace("github:", "").split("/");

// https://astro.build/config
export default defineConfig({
  site: `https://${userName}.github.io`,
  base: `/${repoName}`,
  trailingSlash: "always",

  devToolbar: {
    enabled: false,
  },

  server: {
    host: true,
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.USER_NAME": JSON.stringify(userName),
      "import.meta.env.REPO_NAME": JSON.stringify(repoName),
    },
  },

  integrations: [react()],

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Roboto",
      cssVariable: "--font-roboto",
      weights: [400, 700],
      styles: ["normal"],
    },
  ],
});
