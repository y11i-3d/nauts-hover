// @ts-check
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
// https://astro.build/config
export default defineConfig({
  base: "/nauts-hover/",

  site: "https://example.com",
  trailingSlash: "always",

  devToolbar: {
    enabled: false,
  },

  server: {
    host: true,
  },

  vite: {
    plugins: [tailwindcss()],
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
